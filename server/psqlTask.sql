DO $$
DECLARE
    temprow record;
BEGIN
    FOR temprow IN
        SELECT * FROM borrows
    LOOP
        IF now() NOT BETWEEN temprow.date_of_borrow AND temprow.date_of_exp_return THEN
            UPDATE books SET availability = 2 WHERE id = temprow.f_book_id;
        ELSE
            UPDATE books SET availability = 1 WHERE id = temprow.f_book_id;
        END IF;
    END LOOP;
END $$;
