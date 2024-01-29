CREATE SEQUENCE model_id_seq
    START WITH 1000000000;
ALTER TABLE "Model" ALTER COLUMN "id" SET DEFAULT nextval('model_id_seq');
CREATE SEQUENCE modelversion_id_seq
    START WITH 1000000000;
ALTER TABLE "ModelVersion" ALTER COLUMN "id" SET DEFAULT nextval('modelversion_id_seq');
CREATE SEQUENCE image_id_seq
    START WITH 1000000000;
ALTER TABLE "Image" ALTER COLUMN "id" SET DEFAULT nextval('image_id_seq');
CREATE SEQUENCE answer_id_seq
    START WITH 1000000000;
ALTER TABLE "Answer" ALTER COLUMN "id" SET DEFAULT nextval('answer_id_seq');
CREATE SEQUENCE review_id_seq
    START WITH 1000000000;
ALTER TABLE "Review" ALTER COLUMN "id" SET DEFAULT nextval('review_id_seq');
CREATE SEQUENCE comment_id_seq
    START WITH 1000000000;
ALTER TABLE "Comment" ALTER COLUMN "id" SET DEFAULT nextval('comment_id_seq');
CREATE SEQUENCE post_id_seq
    START WITH 1000000000;
ALTER TABLE "Post" ALTER COLUMN "id" SET DEFAULT nextval('post_id_seq');
CREATE SEQUENCE file_id_seq
    START WITH 1000000000;
ALTER TABLE "File" ALTER COLUMN "id" SET DEFAULT nextval('file_id_seq');