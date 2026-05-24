import pytest
from unittest.mock import patch
from pymongo.errors import WriteError

from src.util.dao import DAO


TEST_COLLECTION = "dao_create_test_collection"


TEST_VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["title", "done"],
        "properties": {
            "title": {
                "bsonType": "string",
                "description": "title must be a string"
            },
            "done": {
                "bsonType": "bool",
                "description": "done must be a boolean"
            }
        }
    }
}


@pytest.fixture
def dao():
    with patch("src.util.dao.getValidator", return_value=TEST_VALIDATOR):
        dao = DAO(TEST_COLLECTION)
        dao.drop()

        dao = DAO(TEST_COLLECTION)
        yield dao

        dao.drop()


def test_create_valid_object(dao):
    data = {
        "title": "Watch video",
        "done": False
    }

    result = dao.create(data)

    assert result is not None
    assert result["title"] == "Watch video"
    assert result["done"] is False
    assert "_id" in result


def test_create_missing_required_property(dao):
    data = {
        "title": "Watch video"
    }

    with pytest.raises(WriteError):
        dao.create(data)


def test_create_wrong_type_for_string_property(dao):
    data = {
        "title": 123,
        "done": False
    }

    with pytest.raises(WriteError):
        dao.create(data)


def test_create_wrong_type_for_boolean_property(dao):
    data = {
        "title": "Watch video",
        "done": "False"
    }

    with pytest.raises(WriteError):
        dao.create(data)