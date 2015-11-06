CREATE USER 'nmrshiftdb'@'localhost' IDENTIFIED BY 'xxswagxx';

CREATE DATABASE mynmrshiftdb1;

GRANT ALL PRIVILEGES ON mynmrshiftdb1.* TO 'nmrshiftdb'@'localhost';
FLUSH PRIVILEGES;

USE mynmrshiftdb1;