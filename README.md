
# Pincode Validator for Shopify 

  
This feature adds a **pincode validator block** for the product page that checks whether a given pincode is serviceable Pincode data must be stored in Google Sheets and dynamically validated against user input.
  
---

## 🚀 Features

  
- Fully integrated as a **custom block** in `main-product.liquid`

- Only **enables Add to Cart / Buy it Now** buttons when a valid pincode is entered

- Pincode list is fetched live from a Google Sheet 

- Matches Ride theme styling (responsive & accessible)

  

---

  

## 📄 Google Sheets Setup

  

### 1. Get Pincode Data

  

1. Visit: [data.gov.in - All India Pincode Directory](https://data.gov.in)

2. Download the pincode dataset (usually in CSV format)

3. Copy only the **pincode column** into a new Google Sheet (first sheet, column A)

  

### 2. Publish Google Sheet

  

1. Click **Share** and ensure the sheet is accessible (Viewer or Anyone with the link)

2. Note your **Google Sheet ID** from the URL:

```

https://docs.google.com/spreadsheets/d/GOOGLE_SHEET_ID/edit

```

  

### 3. Set Up Google Sheets API

  

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a **new project**

3. Enable the **Google Sheets API** for your project

4. Go to **APIs & Services > Credentials**

5. Click **Create Credentials → API Key**

6. Copy the key — this is your `google_sheet_api_key`

  

---

  

## 🛍️ Shopify Integration Steps

  

### 1. Add Block to  Theme
  

1. Place `pincode-validator-block.liquid` inside `/snippets`

2. In `sections/main-product.liquid`, add a block schema:

```json

{

"type": "pincode_validator",

"name": "Pincode Validator",

"settings": [...]

}

```

3. Add this to the block rendering logic:

```liquid

{% when 'pincode_validator' %}

{% render 'pincode-validator-block', block: block %}

```

  

### 2. Use in Theme Editor

  

- Go to **Online Store > Customize**

- On the **Product** template

- Click **Add block** → Choose **Pincode Validator**

- Fill out:

- Google Sheet API Key

- Google Sheet ID

- Sheet Range (e.g., `Sheet1!A1:A100`)

- Save

  

---

  

## ⚠️ Error Handling

  

If any required setting is missing or uses a placeholder:

  

- The block will display a warning like:

> ⚠️ Please enter Google Sheet API Key, and Sheet ID iin the theme editor. This block will not function until then.

  

If Google API fails or range is invalid:

  

- User sees:

> "Error checking pincode."

- Console logs the exact error for debugging

  

If pincode is not found:

  

- User sees:

> "Delivery Not Available ❌"

- Add to Cart & Buy Now remain disabled

  

If valid:

  

- User sees:

> "Delivery Available ✅"

- Add to Cart & Buy Now become active

  

---

  

## 🧪 Notes

  

- Pincode must be a **6-digit number**

- Uses Shopify’s built-in `field__input` and `button` classes for native look

- Multiple blocks are disabled (max 1 per product)

  

---

  

## 📂 Files Included 

  

- `snippets/pincode-validator-block.liquid`
- sections/main-product.liquid 

  

---

  

## 📝 Troubleshooting

  

If you run into trouble:

- Check your **API key permissions**

- Make sure your **sheet is public or shared**

- Confirm the **range (e.g. Sheet1!A1:A100)** includes actual data

- Open **browser console** to view any JS errors