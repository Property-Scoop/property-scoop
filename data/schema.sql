DROP TABLE IF EXISTS locations, buildings;

CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7)
);

CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY,
    pin VARCHAR(255), 
    taxpayer_name VARCHAR(255), 
    prop_name VARCHAR(255),
    jurisdiction VARCHAR(255),
    app_value VARCHAR(255), 
    present_use VARCHAR(255),  
    lot_sqft VARCHAR(255),
    address VARCHAR(255)
);
