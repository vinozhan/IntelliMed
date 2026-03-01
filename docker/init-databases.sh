#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE patient_db;
    CREATE DATABASE doctor_db;
    CREATE DATABASE appointment_db;
    CREATE DATABASE telemedicine_db;
    CREATE DATABASE payment_db;
    CREATE DATABASE notification_db;
    CREATE DATABASE ai_db;
EOSQL
