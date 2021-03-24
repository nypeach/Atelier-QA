CREATE DATABASE qanda;

USE qanda;

CREATE TABLE product (
  id INT PRIMARY KEY
);

CREATE TABLE questions (
  id INT PRIMARY KEY,
  product_id INT NOT NULL,
  body TEXT,
  date_written DATE,
  asker_name VARCHAR(60),
  asker_email VARCHAR(60),
  reported BOOLEAN,
  helpful INT,
  INDEX(product_id)
);

CREATE TABLE answers (
  id INT PRIMARY KEY,
  question_id INT NOT NULL,
  body TEXT,
  date_written DATE,
  answerer_name VARCHAR(60),
  answerer_email VARCHAR(60),
  reported BOOLEAN,
  helpful INT,
  photos TEXT,
  answers TEXT
);

CREATE TABLE answers_photos (
  id INT PRIMARY KEY,
  answer_id INT NOT NULL,
  url TEXT,
  FOREIGN KEY (answer_id) REFERENCES answers(id)
);


LOAD DATA INFILE '/productid.csv'
INTO TABLE product
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

CREATE TEMPORARY TABLE tmp_product(id INT NOT NULL PRIMARY KEY);

LOAD DATA INFILE '/Users/jodisilverman/seip2101/questions.csv'
INTO TABLE questions
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE '/Users/jodisilverman/seip2101/answers.csv'
INTO TABLE answers
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE '/Users/jodisilverman/seip2101/answers_photos.csv'
INTO TABLE answers_photos
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

/* Create other tables and define schemas for them here! */
/* ALTER TABLE table_name AUTO_INCREMENT = value */



/*  Execute this file from the command line by typing:
 *    mysql -u root < server/schema.sql
 *  to create the database and the tables.*/

 SELECT answer_id, GROUP_CONCAT(url) AS url
 FROM answers_photos
 GROUP BY answer_id;




 SELECT question_id, JSON_OBJECT(
   'question_id', question_id,
   'id', id,
   'body', body,
   'date_written', date_written,
   'answerer_name', answerer_name,
   'answerer_email', answerer_email,
   'reported', reported,
   'helpful', helpful) as JSON
  FROM answers;


SELECT
a.question_id,
a.id,
a.body,
a.date_written,
a.answerer_name,
a.answerer_email,
p.url
FROM answers a
LEFT JOIN answers_photos p
ON a.id = p.answer_id



INSERT INTO table_a (col1a, col2a, col3a, …)
SELECT col1b, col2b, col3b, …
FROM table_b
WHERE table_b.col1 = x;

INSERT INTO answers (photos)
select z.url
FROM answers a
LEFT JOIN
(SELECT p.answer_id, GROUP_CONCAT(p.url) AS url
 FROM answers_photos p
 GROUP BY p.answer_id) z
 ON a.id = z.answer_id
WHERE a.id = z.answer_id;



-- ANSWERS AS JSON WITH QUESTION ID
SELECT question_id, JSON_OBJECT(
   'question_id', question_id,
   'id', id,
   'body', body,
   'date_written', date_written,
   'answerer_name', answerer_name,
   'answerer_email', answerer_email,
   'reported', reported,
   'helpful', helpful) as answers
FROM answers


-- GROUPED ANSWERS --
SELECT a.question_id, GROUP_CONCAT(a.JSON) FROM
(SELECT question_id, JSON_OBJECT(
   'question_id', question_id,
   'id', id,
   'body', body,
   'date_written', date_written,
   'answerer_name', answerer_name,
   'answerer_email', answerer_email,
   'reported', reported,
   'helpful', helpful) as answers
  FROM answers) a
  GROUP BY a.question_id




-- SELECT ANSWERS WITH GROUPED PHOTOS --
SELECT
a.question_id,
a.id,
a.body,
a.date_written,
a.answerer_name,
a.answerer_email,
b.url
FROM answers a
LEFT JOIN
(SELECT p.answer_id, GROUP_CONCAT(p.url) AS url
 FROM answers_photos p
 GROUP BY p.answer_id) b
 ON a.id = b.answer_id
 WHERE a.question_id = 36


-- QUESTIONS JOINED WITH JSON ANSWERS JOINED WITH PHOTOS --
SELECT
q.id,
q.product_id,
q.body,
q.date_written,
q.asker_name,
q.asker_email,
q.reported,
q.helpful,
a.answers,
p.answer_id,
p.url
FROM questions q
LEFT JOIN
(SELECT id, question_id, JSON_OBJECT(
   'question_id', question_id,
   'answer_id', id,
   'body', body,
   'date_written', date_written,
   'answerer_name', answerer_name,
   'answerer_email', answerer_email,
   'reported', reported,
   'helpful', helpful) as answers
FROM answers) a
ON q.id = a.question_id
LEFT JOIN answers_photos p
ON a.id = p.answer_id





answers_photos p
ON a.id = p.answer_id












SELECT
q.id,
q.product_id,
q.body,
q.date_written,
q.asker_name,
q.asker_email,
q.reported,
q.helpful,
a.id,
a.question_id,
a.body,
a.date_written,
a.answerer_name,
a.answerer_email,
p.id,
p.answer_id,
p.url
FROM questions q
LEFT JOIN answers a
ON q.id = a.question_id
LEFT JOIN answers_photos p
ON a.id = p.answer_id




SELECT
q.id,
q.product_id,
q.body,
q.date_written,
q.asker_name,
q.asker_email,
q.reported,
q.helpful,
a.id,
a.question_id,
a.body,
a.date_written,
a.answerer_name,
a.answerer_email,
p.id,
p.answer_id,
p.url
FROM questions q
LEFT JOIN answers a
ON q.id = a.question_id
LEFT JOIN answers_photos p
ON a.id = p.answer_id



----------------------- TEMPORARY PHOTOS TABLE GROUPED ---------------------------------------
 CREATE TEMPORARY TABLE photos
 SELECT answer_id, GROUP_CONCAT(url) AS url
 FROM answers_photos
 GROUP BY answer_id;

 ----------------------- TEMPORARY ANSWERS TABLE GROUPED -------------------------------------
CREATE TEMPORARY TABLE answersp
SELECT id, question_id, body, date_written, answerer_name, answerer_email, reported, helpful, p.photos, JSON_OBJECT(
   'id', id,
   'question_id', question_id,
   'body', body,
   'date_written', date_written,
   'answerer_name', answerer_name,
   'answerer_email', answerer_email,
   'reported', reported,
   'helpful', helpful,
   'photos', p.photos) as answers
FROM answers_old a
LEFT JOIN
(SELECT answer_id, json_array(url) as photos from photos) p
ON a.id = p.answer_id

----------------------- QUESTIONS JOINED WITH ANSWERS ----------------------------------------
SELECT
q.id,
q.product_id,
q.body,
q.date_written,
q.asker_name,
q.asker_email,
q.reported,
q.helpful,
a.answers
FROM questions q
LEFT JOIN
answers a
ON q.id = a.question_id
WHERE a.reported <> 1;