$env:DB_URL = "jdbc:postgresql://localhost:5432/inventory_db"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "postgres"
$env:JWT_SECRET = "inventory-sales-hub-dev-secret-key-2025-tfg"

.\gradlew.bat bootRun
