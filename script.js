document.addEventListener("DOMContentLoaded", () => {
  // Check if the user is logged in by checking if 'masterPassword' is set in localStorage
  if (!localStorage.getItem("masterPassword")) {
    window.location.href = "/login.html"; // Redirect to the login page if not logged in
  }

  const form = document.getElementById("templateForm");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const currentDate = formatDate(new Date());
      const contractType = document.querySelector(
        'input[name="contractType"]:checked'
      ).value;
      const formData = {
        name: document.getElementById("name").value,
        address: document.getElementById("address").value,
        dob: document.getElementById("dob").value,
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value, // New field
        role: document.getElementById("role").value,
        day: document.getElementById("day").value,
        contractNumber: document.getElementById("contractNumber").value,
        pay: document.getElementById("pay").value,
        additionalInfo: document.getElementById("additionalInfo").value,
        intellectualProperty: document.getElementById("intellectualProperty")
          .value, // New field
        dateOfContract: currentDate,
      };

      generateDocument(contractType, formData);
    });
  }
});

function generateDocument(template, data) {
  const templatePath = `templates/${template}.docx`;

  // Fetch the Word template
  fetch(templatePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`);
      }
      return response.arrayBuffer();
    })
    .then((content) => {
      const zip = new PizZip(content);
      const doc = new window.docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Set the data for replacing merge fields
      doc.setData({
        Name: data.name,
        Address: data.address,
        DateOfBirth: formatDate(data.dob),
        DateOfCommencement: formatDate(data.startDate),
        DateOfEndOfContract: formatDate(data.endDate), // New merge field
        Role: data.role,
        Day: data.day,
        ContractNumber: data.contractNumber,
        Pay: data.pay,
        AdditionalInformation: data.additionalInfo,
        IntellectualProperty: data.intellectualProperty, // New merge field
        DateOfContract: data.dateOfContract, // Auto-populated contract generation dat
      });

      try {
        // Replace the placeholders with data
        doc.render();
      } catch (error) {
        console.error("Error rendering document:", error);
        alert("Error generating document");
        return;
      }

      // Generate the document as a blob
      const out = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Create the dynamic file name
      const fileName = `${template.replace(/([A-Z])/g, " $1").trim()} - ${
        data.name
      }.docx`;

      // Save the file with the generated name
      saveAs(out, fileName);

      // Show success message
      alert("Document successfully generated and downloaded!");
    })
    .catch((error) => {
      console.error("Error fetching template", error);
      alert("Error loading template");
    });
}

// Helper function to format date from YYYY-MM-DD to dd/Month/yyyy
function formatDate(inputDate) {
  const date = new Date(inputDate);
  const options = { day: "2-digit", month: "long", year: "numeric" };
  return date.toLocaleDateString("en-GB", options);
}
