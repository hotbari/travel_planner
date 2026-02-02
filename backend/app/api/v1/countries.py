from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.country import Country as CountryModel
from app.schemas.country import Country, CountryGreeting
from app.core.constants import INITIAL_COUNTRIES

router = APIRouter()


def init_countries(db: Session):
    """Initialize countries if table is empty."""
    if db.query(CountryModel).count() == 0:
        for country_data in INITIAL_COUNTRIES:
            country = CountryModel(**country_data)
            db.add(country)
        db.commit()


@router.get("", response_model=List[Country])
def get_countries(db: Session = Depends(get_db)):
    """Get all countries with greetings."""
    init_countries(db)
    return db.query(CountryModel).order_by(CountryModel.name).all()


@router.get("/{code}", response_model=Country)
def get_country(code: str, db: Session = Depends(get_db)):
    """Get country by ISO code."""
    init_countries(db)
    country = db.query(CountryModel).filter(CountryModel.code == code.upper()).first()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    return country


@router.get("/{code}/greeting", response_model=CountryGreeting)
def get_greeting(code: str, db: Session = Depends(get_db)):
    """Get just the greeting for a country."""
    init_countries(db)
    country = db.query(CountryModel).filter(CountryModel.code == code.upper()).first()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    return CountryGreeting(code=country.code, name=country.name, greeting=country.greeting)
