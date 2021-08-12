const { items } = require("joi/lib/types/array");

db.items.insertMany(
    [
        {
            "category_id" : ObjectId("6111712af79203355487f5f5"),
            "name": "Tawouk",
            "is_available":1,
            "price": 15,
            "created": "2021-01-01 16:00:00"
        },
        {
            "category_id" : ObjectId("6111712af79203355487f5f5"),
            "name": "Pizza",
            "is_available":1,
            "price": 20,
            "created": "2021-01-01 16:00:00"
        },
        {
            "category_id" : ObjectId("6111712af79203355487f5f5"),
            "name": "Burger",
            "is_available":1,
            "price": 25,
            "created": "2021-01-01 16:00:00"
        },
        {
            "category_id" : ObjectId("6111712af79203355487f5f6"),
            "name": "Vodka",
            "is_available":1,
            "price": 30,
            "created": "2021-01-01 16:00:00"
        },
        {
            "category_id" : ObjectId("6111712af79203355487f5f6"),
            "name": "Gin",
            "is_available":1,
            "price": 35,
            "created": "2021-01-01 16:00:00"
        },
        {
            "category_id" : ObjectId("6111712af79203355487f5f6"),
            "name": "Water",
            "is_available":1,
            "price": 5,
            "created": "2021-01-01 16:00:00"
        },
        {
            "category_id" : ObjectId("6111712af79203355487f5f7"),
            "name": "Sour cream",
            "is_available":1,
            "price": 3,
            "created": "2021-01-01 16:00:00"
        },
        {
            "category_id" : ObjectId("6111712af79203355487f5f7"),
            "name": "Onion",
            "is_available":0,
            "price": 2,
            "created": "2021-01-01 16:00:00"
        },
        {
            "category_id" : ObjectId("6111712af79203355487f5f7"),
            "name": "Cheddar",
            "is_available":1,
            "price": 3,
            "created": "2021-01-01 16:00:00"
        }
])