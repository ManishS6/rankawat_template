require('dotenv').config();
// process.env.USER_ID; // "239482"
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.URL
const supabaseKey = process.env.KEY
const supabase = createClient(supabaseUrl, supabaseKey)
// console.log(supabase); // display Supabase instance information to debug
// const res = supabaseClient.from('register').select('*').eq('id',41);
// if(!res.error) console.log(res);

const express = require('express');
const bodyParser = require('body-parser');
const pdf = require('html-pdf');
const fs = require('fs');

const app = express();

app.use(bodyParser.json());

app.get('/products', async (req, res) => {
  const jsonData = req.body;
  console.log("req is :" , req);
  const {data, error} = await supabase
      .from('register').select('*').eq('id',req.body.id);
  res.send(data);
});

app.get('/generatepdf', (req, res) => {
  // Assuming you have an HTML template file called "template.html"
  var templatePath = "";
  const type_of_document = req.body.type;
  switch(type_of_document){
    case "builty": {
      templatePath = "./builty.html"; 
      req.body.consignor=req.body.consignor.consign; 
      req.body.consignee=req.body.consignee.consign; 
      break;
    }
    case "challan": templatePath = "./challan.html"; break;
    case "receipt": templatePath = "./receipt.html"; break;
  }
  console.log(`XXX: file name is ${templatePath}`)
  const jsonData = req.body;
  console.log("req is :" , req);

  fs.readFile(templatePath, 'utf8', (err, htmlTemplate) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading HTML template' });
    }

    // Replace placeholders in the HTML template with JSON data
    for (const key in jsonData) {
      if (jsonData.hasOwnProperty(key)) {
        console.log(key);
        const regex = new RegExp(`{{${key}}}`, 'g');
        if(key!="type"){
          htmlTemplate = htmlTemplate.replace(regex, jsonData[key]);
        }
      }
    }

    // Define PDF options (you can customize this)
    const pdfOptions = {
      format: 'A4', // or your preferred paper size/format
    };

    // Generate the PDF from the HTML
    pdf.create(htmlTemplate, pdfOptions).toBuffer((err, buffer) => {
      if (err) {
        return res.status(500).json({ error: 'Error generating PDF' });
      }

      // Set the response headers to specify the file type
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');

      // Send the PDF buffer as the response
      res.send(buffer);
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
