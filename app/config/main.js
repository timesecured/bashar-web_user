//const timeSecuredUrl = 'http://rvtechnologies.info:3003/' ; // Live URL
//const timeSecuredUrl = 'http://3.96.252.122:3003/' ; // Live URL
//const timeSecuredUrl = 'http://localhost:3005/' ; // Local URL

const timeSecuredUrl = 'http://timesecured.com:3003/';

module.exports = {
    // Beneficiary Image Url
     beneficiaryFileUrl : `${timeSecuredUrl}uploads/beneficiaries/`,

     // Gmail 
     emailFrom: "Time Secured <donotreply@rvtechnologies.com>",
     // Email Subject 
     emailSubject: "Forgot Password? 🤔",
     
     // JWT Passport
     JWT_SECRET: 'timeSecuredAuthentication',

     // base Url
     baseUrl: timeSecuredUrl,

     // Image Url
     imageUrl : `${timeSecuredUrl}assets/images/`,

     // File Url
     fileUrl : `${timeSecuredUrl}uploads/vaults/`,

    // Image thumbnail Url
    thumbnailUrl : `${timeSecuredUrl}uploads/thumbnails/`,
    
    beneficiaryEmailSubject: "Added Beneficiary",
   
    //File path
    filePath : `/srv/vhost/public_html/Bashar-Backend/public/uploads/vaults/`,

    //Web owner email
    webOwnerEmail: "alert.timesecured@outlook.com",
};    
