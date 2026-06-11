"""
PINESPHERE ERP
Module      : Services - Trainers LMS
File        : lms.py
Purpose     : Trainer-scoped LMS service functions.
              All queries are constrained by Course.trainer_id.
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

from __future__ import annotations

from datetime import datetime

from fastapi import HTTPException, UploadFile
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.lms import Course, Enrollment, Lesson, Quiz
from app.schemas.lms import LessonCreate
from app.schemas.trainer import (
    TrainerLmsCourseDetail,
    TrainerLmsCourseItem,
    TrainerLmsCourseUpdate,
    TrainerLmsCoursesResponse,
    TrainerLmsFeatureStatusItem,
    TrainerLmsLessonItem,
    TrainerLmsLessonUpdate,
    TrainerLmsLessonsResponse,
    TrainerLmsMaterialItem,
)


FEATURE_STATUS = [
    TrainerLmsFeatureStatusItem(
        s_no=35,
        feature="Course Creation Wizard",
        phase="Phase 5",
        status="Available for assigned courses",
    ),
    TrainerLmsFeatureStatusItem(
        s_no=36,
        feature="Video Lesson Upload & HLS Streaming",
        phase="Phase 5",
        status="Uses saved lesson video links",
    ),
    TrainerLmsFeatureStatusItem(
        s_no=37,
        feature="PDF / Document Attachment",
        phase="Phase 5",
        status="Uses saved lesson PDF links",
    ),
    TrainerLmsFeatureStatusItem(
        s_no=45,
        feature="AI Quiz Generator",
        phase="Phase 5",
        status="No quiz generator records yet",
    ),
    TrainerLmsFeatureStatusItem(
        s_no=99,
        feature="GitHub Repository Integration",
        phase="Phase 5",
        status="No repository records yet",
    ),
]


def _course_counts(db: Session, course_id: str) -> dict[str, int]:
    lesson_count = (
        db.query(func.count(Lesson.id))
        .filter(Lesson.course_id == course_id)
        .scalar()
        or 0
    )
    quiz_count = (
        db.query(func.count(Quiz.id))
        .filter(Quiz.course_id == course_id)
        .scalar()
        or 0
    )
    material_count = (
        db.query(func.count(Lesson.id))
        .filter(
            Lesson.course_id == course_id,
            Lesson.content_type != "assignment",
            or_(
                (Lesson.video_url.isnot(None) & (Lesson.video_url != "")),
                (Lesson.pdf_url.isnot(None) & (Lesson.pdf_url != "")),
                (Lesson.assignment_url.isnot(None) & (Lesson.assignment_url != "")),
            ),
        )
        .scalar()
        or 0
    )
    enrolled_students = (
        db.query(func.count(Enrollment.id))
        .filter(Enrollment.course_id == course_id, func.lower(Enrollment.status) == "active")
        .scalar()
        or 0
    )
    return {
        "lesson_count": int(lesson_count),
        "material_count": int(material_count),
        "quiz_count": int(quiz_count),
        "enrolled_students": int(enrolled_students),
    }


def _course_item(db: Session, course: Course) -> TrainerLmsCourseItem:
    counts = _course_counts(db, course.id)
    return TrainerLmsCourseItem(
        id=course.id,
        title=course.title,
        description=course.description,
        status=course.status,
        difficulty_level=course.difficulty_level,
        duration=course.duration,
        thumbnail_url=course.thumbnail_url,
        display_code=course.display_code,
        lesson_count=counts["lesson_count"],
        material_count=counts["material_count"],
        quiz_count=counts["quiz_count"],
        enrolled_students=counts["enrolled_students"],
        can_create_lessons=True,
        can_upload_materials=False,
        created_at=course.created_at.isoformat() if course.created_at else None,
        updated_at=course.updated_at.isoformat() if course.updated_at else None,
    )


def get_trainer_courses(db: Session, trainer_id: str) -> TrainerLmsCoursesResponse:
    courses = (
        db.query(Course)
        .filter(Course.trainer_id == trainer_id)
        .order_by(Course.updated_at.desc(), Course.created_at.desc())
        .all()
    )
    items = [_course_item(db, course) for course in courses]
    total_lessons = sum(item.lesson_count or 0 for item in items)
    uploaded_materials = sum(item.material_count or 0 for item in items)

    return TrainerLmsCoursesResponse(
        summary={
            "total_courses": len(items),
            "total_lessons": total_lessons,
            "uploaded_materials": uploaded_materials,
            "quiz_tools": sum(item.quiz_count or 0 for item in items),
        },
        courses=items,
        feature_status=FEATURE_STATUS,
        updated_at=datetime.utcnow().isoformat(),
    )


def verify_course_ownership(db: Session, trainer_id: str, course_id: str) -> Course:
    course = (
        db.query(Course)
        .filter(Course.id == course_id, Course.trainer_id == trainer_id)
        .first()
    )
    if not course:
        raise HTTPException(status_code=404, detail="Trainer course not found")
    return course


def get_trainer_course_detail(
    db: Session,
    trainer_id: str,
    course_id: str,
) -> TrainerLmsCourseDetail:
    course = verify_course_ownership(db, trainer_id, course_id)
    item = _course_item(db, course)
    return TrainerLmsCourseDetail(**item.dict())


def _lesson_item(lesson: Lesson) -> TrainerLmsLessonItem:
    return TrainerLmsLessonItem(
        id=lesson.id,
        course_id=lesson.course_id,
        title=lesson.title,
        summary=lesson.summary,
        content=lesson.content,
        video_url=lesson.video_url,
        pdf_url=lesson.pdf_url,
        assignment_url=lesson.assignment_url,
        content_type=lesson.content_type,
        due_at=lesson.due_at.isoformat() if lesson.due_at else None,
        max_marks=lesson.max_marks or 0,
        sort_order=lesson.sort_order or 1,
        is_preview=bool(lesson.is_preview),
        created_at=lesson.created_at.isoformat() if lesson.created_at else None,
    )


def get_trainer_lessons(
    db: Session,
    trainer_id: str,
    course_id: str,
) -> TrainerLmsLessonsResponse:
    verify_course_ownership(db, trainer_id, course_id)
    lessons = (
        db.query(Lesson)
        .filter(Lesson.course_id == course_id)
        .order_by(Lesson.sort_order.asc(), Lesson.created_at.asc())
        .all()
    )
    return TrainerLmsLessonsResponse(
        lessons=[_lesson_item(lesson) for lesson in lessons],
        updated_at=datetime.utcnow().isoformat(),
    )


def create_trainer_lesson(
    db: Session,
    trainer_id: str,
    course_id: str,
    body: LessonCreate,
) -> TrainerLmsLessonItem:
    verify_course_ownership(db, trainer_id, course_id)
    lesson = Lesson(course_id=course_id, **body.dict())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return _lesson_item(lesson)


def upload_trainer_material_contract(
    db: Session,
    trainer_id: str,
    course_id: str,
    file: UploadFile,
) -> dict[str, str]:
    verify_course_ownership(db, trainer_id, course_id)
    _ = file.filename
    return {
        "status": "pending_storage",
        "message": "Upload storage will be enabled after material persistence is added.",
    }


def get_trainer_materials(db: Session, trainer_id: str) -> list[TrainerLmsMaterialItem]:
    rows = (
        db.query(Lesson)
        .join(Course, Lesson.course_id == Course.id)
        .filter(
            Course.trainer_id == trainer_id,
            Lesson.content_type != "assignment",
            or_(
                (Lesson.video_url.isnot(None) & (Lesson.video_url != "")),
                (Lesson.pdf_url.isnot(None) & (Lesson.pdf_url != "")),
                (Lesson.assignment_url.isnot(None) & (Lesson.assignment_url != "")),
            ),
        )
        .order_by(Lesson.created_at.desc())
        .all()
    )
    materials: list[TrainerLmsMaterialItem] = []
    for lesson in rows:
        url = lesson.pdf_url or lesson.video_url or lesson.assignment_url
        content_type = "pdf" if lesson.pdf_url else "video" if lesson.video_url else "material"
        materials.append(
            TrainerLmsMaterialItem(
                id=lesson.id,
                course_id=lesson.course_id,
                filename=lesson.title,
                content_type=content_type,
                url=url,
                created_at=lesson.created_at.isoformat() if lesson.created_at else None,
            )
        )
    return materials


def _verify_lesson_ownership(db: Session, course_id: str, lesson_id: str) -> Lesson:
    lesson = (
        db.query(Lesson)
        .filter(Lesson.id == lesson_id, Lesson.course_id == course_id)
        .first()
    )
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


def update_trainer_lesson(
    db: Session,
    trainer_id: str,
    course_id: str,
    lesson_id: str,
    body: TrainerLmsLessonUpdate,
) -> TrainerLmsLessonItem:
    verify_course_ownership(db, trainer_id, course_id)
    lesson = _verify_lesson_ownership(db, course_id, lesson_id)
    update_data = body.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lesson, field, value)
    db.commit()
    db.refresh(lesson)
    return _lesson_item(lesson)


def delete_trainer_lesson(
    db: Session,
    trainer_id: str,
    course_id: str,
    lesson_id: str,
) -> None:
    verify_course_ownership(db, trainer_id, course_id)
    lesson = _verify_lesson_ownership(db, course_id, lesson_id)
    db.delete(lesson)
    db.commit()


def update_trainer_course_status(
    db: Session,
    trainer_id: str,
    course_id: str,
    body: TrainerLmsCourseUpdate,
) -> TrainerLmsCourseDetail:
    course = verify_course_ownership(db, trainer_id, course_id)
    update_data = body.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    item = _course_item(db, course)
    return TrainerLmsCourseDetail(**item.dict())