-- Consumer
CREATE USER consumer WITH ENCRYPTED PASSWORD 'consumer' SUPERUSER;
CREATE DATABASE consumer;

-- Provider
CREATE USER qna WITH ENCRYPTED PASSWORD 'provider-qna' SUPERUSER;
CREATE DATABASE provider_qna;

CREATE USER manufacturing WITH ENCRYPTED PASSWORD 'provider-manufacturing' SUPERUSER;
CREATE DATABASE provider_manufacturing;

CREATE USER identity WITH ENCRYPTED PASSWORD 'identity' SUPERUSER;
CREATE DATABASE identity;

CREATE USER catalog_server WITH ENCRYPTED PASSWORD 'catalog_server' SUPERUSER;
CREATE DATABASE catalog_server;

-- Issuer
CREATE USER issuer WITH ENCRYPTED PASSWORD 'issuer' SUPERUSER;
CREATE DATABASE issuer;

\c issuer issuer

create table if not exists membership_attestations
(
    membership_type       integer   default 0,
    holder_id             varchar                             not null,
    membership_start_date timestamp default now()             not null,
    id                    varchar   default gen_random_uuid() not null
        constraint attestations_pk
            primary key
);

create unique index if not exists membership_attestation_holder_id_uindex
  on membership_attestations (holder_id);

-- Seed the consumer and provider into the attestations DB
INSERT INTO membership_attestations (membership_type, holder_id) VALUES (1, 'did:web:localhost%3A7083:consumer');
INSERT INTO membership_attestations (membership_type, holder_id) VALUES (2, 'did:web:localhost%3A7093:provider');
