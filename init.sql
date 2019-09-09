CREATE TABLE hair_stylists(
	id SERIAL,
    name TEXT NOT NULL, 
    image TEXT NOT NULL, 
    description TEXT NOT NULL, 
    salon_id INTEGER, 
    location VARCHAR(255), 
    phone VARCHAR(15), 
    email VARCHAR(255)
);

CREATE TABLE hair_styles( 
	id SERIAL, 
    name VARCHAR(255) NOT NULL, 
    image TEXT NOT NULL, 
    description TEXT NOT NULL, 
    stylist_id INTEGER, 
    likes INTEGER DEFAULT 0,
    length VARCHAR(255), 
    gender VARCHAR(255), 
    thickness VARCHAR(255), 
    color VARCHAR(255), 
    perm VARCHAR(255), 
    date_created DATE default Now());
    
CREATE TABLE hair_salons( 
	id SERIAL, 
    name VARCHAR(255) NOT NULL, 
    image TEXT NOT NULL,  
    description TEXT, 
    location VARCHAR(255), 
    phone VARCHAR(15), 
    email VARCHAR(255)
);

CREATE TABLE hair_images( 
	id SERIAL, 
    hair_id INTEGER NOT NULL, 
    hair_url TEXT NOT NULL
);