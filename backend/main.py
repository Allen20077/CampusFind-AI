from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client

import os
import uuid
import requests


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "lost-found")


# =========================================================
# CHECK SUPABASE CONFIGURATION
# =========================================================

if not SUPABASE_URL:
    raise RuntimeError(
        "SUPABASE_URL is missing from backend/.env"
    )

if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "SUPABASE_SERVICE_ROLE_KEY is missing from backend/.env"
    )


# =========================================================
# SUPABASE CONNECTION
# =========================================================

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Christ Deemed to be University CampusFind AI Backend",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://campusfind-ai-ten.vercel.app",
    
    # Capacitor Android
        "http://localhost",
        "https://localhost",
        "capacitor://localhost",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "CampusFind AI Backend Running 🚀"
    }


# =========================================================
# BACKEND TEST
# =========================================================

@app.get("/api/test")
def test_backend():
    return {
        "message": "Backend connection successful 🚀"
    }


# =========================================================
# CREATE LOST / FOUND REPORT
# =========================================================

@app.post("/api/reports")
async def create_report(
    
    type: str = Form(...),
    item_name: str = Form(...),
    category: str = Form(...),
    colour: str = Form(...),
    location: str = Form(...),
    date: str = Form(...),
    time: Optional[str] = Form(None),
    description: str = Form(...),
    contact: str = Form(...),
    user_id: str = Form(None),
    photo: Optional[UploadFile] = File(None),
    
):

    try:

        # -------------------------------------------------
        # VALIDATE REPORT TYPE
        # -------------------------------------------------

        if type not in ["lost", "found"]:
            raise HTTPException(
                status_code=400,
                detail="Type must be either 'lost' or 'found'."
            )


        # -------------------------------------------------
        # PHOTO UPLOAD
        # -------------------------------------------------

        photo_path = None
        time_value = time.strip() if time and time.strip() else None

        if photo and photo.filename:

            file_extension = ""

            if "." in photo.filename:
                file_extension = (
                    "."
                    + photo.filename.rsplit(".", 1)[1].lower()
                )

            unique_filename = (
                f"{uuid.uuid4()}{file_extension}"
            )

            photo_path = f"reports/{unique_filename}"

            photo_data = await photo.read()

            if not photo_data:
                raise HTTPException(
                    status_code=400,
                    detail="Uploaded photo is empty."
                )


            # -------------------------------------------------
            # SUPABASE STORAGE REST API
            # -------------------------------------------------

            storage_url: str = (
                f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/"
                f"{SUPABASE_BUCKET}/{photo_path.lstrip('/')}"
            )

            print("STORAGE URL:", storage_url)

            headers = {
                "Authorization": (
                    f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
                ),
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Content-Type": (
                    photo.content_type
                    or "application/octet-stream"
                ),
                "x-upsert": "false",
            }


            storage_response = requests.post(
                storage_url,
                headers=headers,
                data=photo_data,
                timeout=60,
            )


            # -------------------------------------------------
            # CHECK STORAGE RESPONSE
            # -------------------------------------------------

            if not storage_response.ok:

                print(
                    "SUPABASE STORAGE ERROR:"
                )

                print(
                    storage_response.status_code
                )

                print(
                    storage_response.text
                )

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Photo upload failed: "
                        f"{storage_response.text}"
                    )
                )


            print(
                f"PHOTO UPLOADED: {photo_path}"
            )


        # -------------------------------------------------
        # CREATE DATABASE RECORD
        # -------------------------------------------------

        report_data = {
            "type": type,
            "item_name": item_name,
            "category": category,
            "colour": colour,
            "location": location,
            "date": date,
            "time": time_value,
            "description": description,
            "contact": contact,
            "photo_path": photo_path,
            "status": "active",
            "user_id": user_id,
        }


        # -------------------------------------------------
        # INSERT INTO SUPABASE DATABASE
        # -------------------------------------------------

        result = (
            supabase
            .table("reports")
            .insert(report_data)
            .execute()
        )


        # -------------------------------------------------
        # CHECK DATABASE RESULT
        # -------------------------------------------------

        if not result.data:
            raise Exception(
                "Supabase did not return the inserted report."
            )


        saved_report = result.data[0]


        print(
            "NEW REPORT SAVED TO SUPABASE:"
        )

        print(saved_report)


        # -------------------------------------------------
        # RETURN SUCCESS
        # -------------------------------------------------

        return {
            "success": True,
            "message": "Report submitted successfully",
            "report": saved_report,
        }


    # =====================================================
    # HTTP ERRORS
    # =====================================================

    except HTTPException:
        raise


    # =====================================================
    # OTHER ERRORS
    # =====================================================

    except Exception as e:

        print(
            "REPORT SUBMISSION ERROR:"
        )

        print(
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Failed to save report: {str(e)}"
        )


# =========================================================
# GET ALL REPORTS
# =========================================================

@app.get("/api/reports")
def get_reports():

    try:

        result = (
            supabase
            .table("reports")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "success": True,
            "reports": result.data or [],
        }


    except Exception as e:

        print(
            "GET REPORTS ERROR:"
        )

        print(
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Failed to load reports: {str(e)}"
        )
        
        # =========================================================
# MARK REPORT AS RECOVERED + DELETE PHOTO
# =========================================================

@app.patch("/api/reports/{report_id}/recover")
def recover_report(report_id: str):
    try:

        # Find the report
        report_result = (
            supabase
            .table("reports")
            .select("*")
            .eq("id", report_id)
            .execute()
        )

        if not report_result.data:
            raise HTTPException(
                status_code=404,
                detail="Report not found."
            )

        report = report_result.data[0]

        # Get photo path
        photo_path = report.get("photo_path")

        # Delete photo from Supabase Storage
        if photo_path:

            storage_url = (
                f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/"
                f"{SUPABASE_BUCKET}/{photo_path.lstrip('/')}"
            )

            headers = {
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
            }

            delete_response = requests.delete(
                storage_url,
                headers=headers,
                timeout=60,
            )

            print(
                "PHOTO DELETE STATUS:",
                delete_response.status_code
            )

            if not delete_response.ok:
                print(
                    "PHOTO DELETE ERROR:",
                    delete_response.text
                )

                raise HTTPException(
                    status_code=500,
                    detail="Failed to delete item photo."
                )

            print(
                f"PHOTO PERMANENTLY DELETED: {photo_path}"
            )

        # Mark report as recovered
        update_result = (
            supabase
            .table("reports")
            .update({
                "status": "recovered",
                "photo_path": None,
            })
            .eq("id", report_id)
            .execute()
        )

        if not update_result.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to update report status."
            )

        return {
            "success": True,
            "message": "Item recovered and photo permanently deleted.",
            "report": update_result.data[0],
        }

    except HTTPException:
        raise

    except Exception as e:

        print("RECOVER REPORT ERROR:")
        print(repr(e))

        raise HTTPException(
            status_code=500,
            detail=f"Failed to recover item: {str(e)}"
        )