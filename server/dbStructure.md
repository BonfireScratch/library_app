## Books Table

```sql
CREATE TABLE books(
    id SERIAL NOT NULL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(200) NOT NULL,
    publisher VARCHAR(100) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    availability SMALLINT NOT NULL
);
```

## Users Table

```sql
CREATE TABLE users(
    id SERIAL NOT NULL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    fathers_name VARCHAR(100) NOT NULL,
    year_of_birth SMALLINT NOT NULL,
    class VARCHAR(10) NOT NULL,
    date_of_join DATE NOT NULL
);
```

## Borrows Table

```sql
CREATE TABLE borrows(
    id SERIAL NOT NULL PRIMARY KEY,
    f_user_id INT,
    f_book_id INT,
    date_of_borrow DATE NOT NULL,
    date_of_exp_return DATE NOT NULL,
    FOREIGN KEY (f_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (f_book_id) REFERENCES books(id) ON DELETE CASCADE
);
```

## Borrow_history Table

```sql
CREATE TABLE borrow_history(
    id SERIAL NOT NULL PRIMARY KEY,
    f_user_id INT,
    f_book_id INT,
    date_of_borrow DATE NOT NULL,
    date_of_exp_return DATE NOT NULL,
    date_of_act_return DATE NOT NULL,
    FOREIGN KEY (f_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (f_book_id) REFERENCES books(id) ON DELETE CASCADE
);
```
