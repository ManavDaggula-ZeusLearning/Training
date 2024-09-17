-- SETTING OFFSET TO FILL DATA FROM EARLIEST ENTRY
SET 'auto.offset.reset' = 'earliest';

-- CREATING STREAMS
-- CREATE STREAM DISTRICT_VALUES (BEFORE STRUCT<ID INT, NAME VARCHAR>, AFTER STRUCT<ID INT, NAME VARCHAR>, OP VARCHAR, TS_MS BIGINT) WITH (KAFKA_TOPIC='dbserver1.kafkadb.district', VALUE_FORMAT='JSON');
-- CREATE STREAM SCHOOLS_VALUES(BEFORE STRUCT<ID INT, NAME VARCHAR, DISRTICT_ID INT>, AFTER STRUCT<ID INT, NAME VARCHAR, DISTRICT_ID INT>, OP VARCHAR, TS_MS BIGINT) WITH (KAFKA_TOPIC='dbserver1.kafkadb.schools', VALUE_FORMAT='JSON');
-- CREATE STREAM CLASS_VALUES(BEFORE STRUCT<ID INT, NAME VARCHAR, SCHOOL_ID INT>, AFTER STRUCT<ID INT, NAME VARCHAR, SCHOOL_ID INT>, OP VARCHAR, TS_MS BIGINT) WITH (KAFKA_TOPIC='dbserver1.kafkadb.class', VALUE_FORMAT='JSON');
-- CREATE STREAM USER_VALUES(BEFORE STRUCT<ID INT, NAME VARCHAR, DOB DATE>, AFTER STRUCT<ID INT, NAME VARCHAR, DOB DATE>, OP VARCHAR, TS_MS BIGINT) WITH (KAFKA_TOPIC='dbserver1.kafkadb.users', VALUE_FORMAT='JSON');
-- CREATE STREAM ENROLLMENT_VALUES(BEFORE STRUCT<USER_ID INT, CLASS_ID INT, ID INT>, AFTER STRUCT<USER_ID INT, CLASS_ID INT, ID INT>, OP VARCHAR, TS_MS BIGINT) WITH (KAFKA_TOPIC='dbserver1.kafkadb.enrollment', VALUE_FORMAT='JSON');

-- CREATING TABLES
-- CREATE TABLE DISTRICT_TABLE AS SELECT DISTRICT_VALUES.AFTER->ID ID, LATEST_BY_OFFSET(DISTRICT_VALUES.AFTER->NAME) NAME FROM DISTRICT_VALUES DISTRICT_VALUES GROUP BY DISTRICT_VALUES.AFTER->ID EMIT CHANGES;
--CREATE TABLE SCHOOLS_TABLE AS SELECT AFTER->ID ID, LATEST_BY_OFFSET(AFTER->NAME) NAME, LATEST_BY_OFFSET(AFTER->DISTRICT_ID) DISTRICT_ID FROM SCHOOLS_VALUES GROUP BY AFTER->ID EMIT CHANGES;
-- create table schools_table as select s.after->id as id, latest_by_offset(s.after->name) as school, latest_by_offset(d.name) as district, latest_by_offset(d.id) as district_id from schools_values s join district_table d on s.after->district_id=d.id group by s.after->id emit changes;
-- CREATE TABLE CLASS_TABLE AS SELECT AFTER->ID AS ID, LATEST_BY_OFFSET(AFTER->NAME) AS NAME, LATEST_BY_OFFSET(AFTER->SCHOOL_ID) AS SCHOOL_ID FROM CLASS_VALUES GROUP BY AFTER->ID EMIT CHANGES;
-- create table class_denorm as select * from class_table c join schools_table s on c.school_id=s.id emit changes;
-- CREATE TABLE USER_TABLE AS SELECT AFTER->ID AS ID, LATEST_BY_OFFSET(AFTER->NAME) AS NAME, LATEST_BY_OFFSET(AFTER->DOB) AS DOB FROM USER_VALUES GROUP BY AFTER->ID EMIT CHANGES;
-- CREATE TABLE ENROLLMENT_TABLE AS SELECT E.AFTER->ID, LATEST_BY_OFFSET(E.AFTER->USER_ID) AS USER, LATEST_BY_OFFSET(E.AFTER->CLASS_ID) AS CLASS FROM ENROLLMENT_VALUES E GROUP BY E.AFTER->ID EMIT CHANGES;



-- SAMPLE JOIN QUERIES
-- SELECT S.ID, S.NAME, D.NAME AS LOCATION FROM SCHOOLS_TABLE AS S LEFT JOIN DISTRICT_TABLE AS D ON S.DISTRICT_ID=D.ID EMIT CHANGES;
-- SELECT C.ID, C.NAME, S.NAME AS SCHOOL FROM CLASS_TABLE AS C LEFT JOIN SCHOOLS_TABLE AS S ON C.SCHOOL_ID=S.ID EMIT CHANGES;



-- CREATE TABLE SCHOOLS_ENRICHED AS SELECT S.ID, S.NAME, D.NAME AS LOCATION FROM SCHOOLS_TABLE AS S LEFT JOIN DISTRICT_TABLE AS D ON S.DISTRICT_ID=D.ID EMIT CHANGES;
-- CREATE TABLE CLASS_ENRICHED AS SELECT C.ID AS ID, C.NAME AS NAME, S.S_NAME AS SCHOOL, LOCATION AS LOCATION FROM CLASS_TABLE C JOIN SCHOOLS_ENRICHED S ON C.SCHOOL_ID=S.S_ID EMIT CHANGES;
-- CREATE TABLE ENROLLMENT_CLASS_ENRICHED AS SELECT E.ID, E.USER AS USER, C.NAME AS CLASS, C.SCHOOL, C.LOCATION FROM ENROLLMENT_TABLE E JOIN CLASS_ENRICHED C ON C.ID=E.CLASS EMIT CHANGES;
-- CREATE TABLE ENROLLMENT_COMPLETE_TABLE AS SELECT E.E_ID AS ID, U.NAME AS USER, U.DOB AS DOB, E.CLASS AS CLASS, E.SCHOOL AS SCHOOL, E.LOCATION AS LOCATION FROM ENROLLMENT_CLASS_ENRICHED E JOIN USER_TABLE U ON E.USER=U.ID EMIT CHANGES;


-- Trying with tombstone records
CREATE STREAM DISTRICT_KEY_VALUES (ROWKEY STRUCT<ID INT> KEY, BEFORE STRUCT<ID INT, NAME VARCHAR>, AFTER STRUCT<ID INT, NAME VARCHAR>, OP VARCHAR, TS_MS BIGINT) WITH (KAFKA_TOPIC='dbserver1.kafkadb.district', VALUE_FORMAT='JSON', KEY_FORMAT='JSON');
CREATE STREAM SCHOOLS_KEY_VALUES(ROWKEY STRUCT<ID INT> KEY, BEFORE STRUCT<ID INT, NAME VARCHAR, DISRTICT_ID INT>, AFTER STRUCT<ID INT, NAME VARCHAR, DISTRICT_ID INT>, OP VARCHAR, TS_MS BIGINT) WITH (KAFKA_TOPIC='dbserver1.kafkadb.schools', VALUE_FORMAT='JSON', KEY_FORMAT='JSON');
CREATE STREAM CLASS_KEY_VALUES(ROWKEY STRUCT<ID INT> KEY, BEFORE STRUCT<ID INT, NAME VARCHAR, SCHOOL_ID INT>, AFTER STRUCT<ID INT, NAME VARCHAR, SCHOOL_ID INT>, OP VARCHAR, TS_MS BIGINT) WITH (KAFKA_TOPIC='dbserver1.kafkadb.class', VALUE_FORMAT='JSON', KEY_FORMAT='JSON');
CREATE STREAM USER_KEY_VALUES(ROWKEY STRUCT<ID INT> KEY, BEFORE STRUCT<ID INT, NAME VARCHAR, DOB DATE>, AFTER STRUCT<ID INT, NAME VARCHAR, DOB DATE>, OP VARCHAR, TS_MS BIGINT) WITH (KAFKA_TOPIC='dbserver1.kafkadb.users', VALUE_FORMAT='JSON', KEY_FORMAT='JSON');
CREATE STREAM ENROLLMENT_KEY_VALUES(ROWKEY STRUCT<ID INT> KEY, BEFORE STRUCT<USER_ID INT, CLASS_ID INT, ID INT>, AFTER STRUCT<USER_ID INT, CLASS_ID INT, ID INT>, OP VARCHAR, TS_MS BIGINT) WITH (KAFKA_TOPIC='dbserver1.kafkadb.enrollment', KEY_FORMAT='JSON',VALUE_FORMAT='JSON');
CREATE STREAM LOGIN_KEY_VALUES(AFTER STRUCT<USER_ID INT, TIMESTAMP TIMESTAMP>) WITH (KAFKA_TOPIC='dbserver1.kafkadb.login', VALUE_FORMAT='JSON');
CREATE STREAM LOGIN AS SELECT AFTER->USER_ID, AFTER->TIMESTAMP FROM LOGIN_key_values;

-- CREATE TABLE DISTRICT_EXISTING_TABLE AS SELECT ROWKEY, LATEST_BY_OFFSET(AFTER) AFTER, LATEST_BY_OFFSET(OP) OP, LATEST_BY_OFFSET(BEFORE) BEFORE FROM DISTRICT_KEY_VALUES GROUP BY ROWKEY HAVING LATEST_BY_OFFSET(OP)!='d' EMIT CHANGES;
--CREATE TABLE DISTRICT_EXISTING_TABLE_2 AS SELECT ROWKEY->id, LATEST_BY_OFFSET(AFTER) AFTER, LATEST_BY_OFFSET(OP) OP, LATEST_BY_OFFSET(BEFORE) BEFORE FROM DISTRICT_KEY_VALUES GROUP BY ROWKEY HAVING LATEST_BY_OFFSET(OP)!='d' EMIT CHANGES;
-- CREATE TABLE SCHOOLS_EXISTING_TABLE AS SELECT ROWKEY, LATEST_BY_OFFSET(AFTER) AFTER, LATEST_BY_OFFSET(OP) OP, LATEST_BY_OFFSET(BEFORE) BEFORE FROM SCHOOLS_KEY_VALUES GROUP BY ROWKEY HAVING LATEST_BY_OFFSET(OP)!='d' EMIT CHANGES;
-- CREATE TABLE CLASS_EXISTING_TABLE AS SELECT ROWKEY, LATEST_BY_OFFSET(AFTER) AFTER, LATEST_BY_OFFSET(OP) OP, LATEST_BY_OFFSET(BEFORE) BEFORE FROM CLASS_KEY_VALUES GROUP BY ROWKEY HAVING LATEST_BY_OFFSET(OP)!='d' EMIT CHANGES;
-- CREATE TABLE USER_EXISTING_TABLE AS SELECT ROWKEY, LATEST_BY_OFFSET(AFTER) AFTER, LATEST_BY_OFFSET(OP) OP, LATEST_BY_OFFSET(BEFORE) BEFORE FROM USER_KEY_VALUES GROUP BY ROWKEY HAVING LATEST_BY_OFFSET(OP)!='d' EMIT CHANGES;
-- CREATE TABLE ENROLLMENT_EXISTING_TABLE AS SELECT ROWKEY, LATEST_BY_OFFSET(AFTER) AFTER, LATEST_BY_OFFSET(OP) OP, LATEST_BY_OFFSET(BEFORE) BEFORE FROM ENROLLMENT_KEY_VALUES GROUP BY ROWKEY HAVING LATEST_BY_OFFSET(OP)!='d' EMIT CHANGES;

CREATE TABLE DISTRICT_TABLE as SELECT ROWKEY->ID AS ID, LATEST_BY_OFFSET(AFTER->NAME) AS NAME FROM DISTRICT_KEY_VALUES GROUP BY ROWKEY->ID HAVING latest_by_offset(OP)!='d' EMIT CHANGES;
CREATE TABLE SCHOOL_TABLE AS SELECT ROWKEY->ID AS ID, LATEST_BY_OFFSET(AFTER->NAME) AS NAME, LATEST_BY_OFFSET(AFTER->DISTRICT_ID) AS DISTRICT_ID FROM SCHOOLS_KEY_VALUES GROUP BY ROWKEY->ID HAVING LATEST_BY_OFFSET(OP)!='d' EMIT CHANGES;
CREATE TABLE CLASS_TABLE AS SELECT ROWKEY->ID AS ID, LATEST_BY_OFFSET(AFTER->NAME) AS NAME, LATEST_BY_OFFSET(AFTER->SCHOOL_ID) AS SCHOOL_ID FROM CLASS_KEY_VALUES GROUP BY ROWKEY->ID HAVING LATEST_BY_OFFSET(OP)!='d' EMIT CHANGES;
CREATE TABLE USER_TABLE AS SELECT ROWKEY->ID AS ID, LATEST_BY_OFFSET(AFTER->NAME) AS NAME, LATEST_BY_OFFSET(AFTER->DOB) AS DOB FROM USER_KEY_VALUES GROUP BY ROWKEY->ID HAVING LATEST_BY_OFFSET(OP)!='d' EMIT CHANGES;
CREATE TABLE ENROLLMENT_TABLE AS SELECT ROWKEY->ID AS ID, LATEST_BY_OFFSET(AFTER->USER_ID) AS USER_ID, LATEST_BY_OFFSET(AFTER->CLASS_ID) AS CLASS_ID FROM ENROLLMENT_KEY_VALUES GROUP BY ROWKEY->ID HAVING LATEST_BY_OFFSET(OP)!='d' EMIT CHANGES;

CREATE TABLE SCHOOL_DISTRICT_ENRICHED AS SELECT S.ID AS ID, S.NAME AS SCHOOL, D.NAME AS DISTRICT FROM SCHOOL_TABLE S JOIN DISTRICT_TABLE D ON S.DISTRICT_ID=D.ID EMIT CHANGES;
CREATE TABLE CLASS_ENRICHED AS SELECT C.ID AS ID, C.NAME AS NAME, S.SCHOOL AS SCHOOL, S.DISTRICT AS DISTRICT FROM CLASS_TABLE C JOIN SCHOOL_DISTRICT_ENRICHED S ON C.SCHOOL_ID=S.ID EMIT CHANGES;