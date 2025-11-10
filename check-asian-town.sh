#!/bin/bash

echo "=== Checking Asian Town Restaurants in Database ==="
echo ""

restaurants=(
  "Mala Sichuan Bistro"
  "Phat Eatery"
  "Haidilao Hotpot"
  "Supreme Dumplings"
  "Ten Seconds Yunnan Rice Noodle"
  "Yummy Pho & Bo Ne"
  "Hong Kong Food Street"
  "Loves Dumpling House"
  "Uncle Chin's Kitchen"
  "Bon Galbi"
  "Tan Tan Wok"
  "AMA Kitchen"
)

for restaurant in "${restaurants[@]}"; do
  echo "Checking: $restaurant"
  result=$(curl -s "http://localhost:3000/api/admin/import-restaurant?q=$restaurant Katy" -H "Authorization: Bearer ekaty-admin-secret-2025")

  if echo "$result" | grep -q '"inDatabase":true'; then
    echo "  ✓ Found in database"
  elif echo "$result" | grep -q '"inDatabase":false'; then
    echo "  ✗ NOT in database - needs import"
    echo "  Place ID: $(echo "$result" | grep -o '"placeId":"[^"]*' | cut -d'"' -f4)"
  elif echo "$result" | grep -q '"found":false'; then
    echo "  ? Not found on Google Places"
  else
    echo "  ? Unknown status"
  fi
  echo ""
done
