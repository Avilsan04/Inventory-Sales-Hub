-- V1__init_schema.sql
-- Foundational schema for Inventory Sales Hub
-- Engine: PostgreSQL

-- Sequence for app_user matching JPA allocationSize=50 for JDBC Batching
CREATE SEQUENCE app_user_id_seq 
    START WITH 1 
    INCREMENT BY 50 
    NO MINVALUE 
    NO MAXVALUE 
    CACHE 1;

-- Table definition reflecting UserJpaEntity.java strictly
CREATE TABLE app_user (
    id BIGINT NOT NULL DEFAULT nextval('app_user_id_seq'),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(60) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_app_user PRIMARY KEY (id),
    CONSTRAINT uk_app_user_username UNIQUE (username),
    CONSTRAINT uk_app_user_email UNIQUE (email)
);

-- Index optimization for login queries
CREATE INDEX idx_app_user_username ON app_user(username);
CREATE INDEX idx_app_user_email ON app_user(email);