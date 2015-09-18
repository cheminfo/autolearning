CREATE USER 'nmrshiftdb'@'localhost' IDENTIFIED BY 'xxswagxx';

CREATE DATABASE mynmrshiftdb3;

GRANT ALL PRIVILEGES ON mynmrshiftdb3.* TO 'nmrshiftdb'@'localhost';
FLUSH PRIVILEGES;

USE mynmrshiftdb3;