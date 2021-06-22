const fs = require("fs");
const https = require("https");
const crypto = require("crypto");

const url = "beta.dokobit.com";
const accessToken = "";
const file = process.argv[2] ?? "./test.pdf";
const email = process.argv[3] ?? "test+nodejs@dokobit.com";

(async () => {
    console.log("Portal API signing creation NodeJS example\n")

    if (!accessToken) {
        console.error("Access Token is required. Enter at line 6");
        return;
    }
    
    if (!fs.existsSync(file)) {
        console.error(`File not found at ${file}.`);
        return;
    }

    const fileBuffer = fs.readFileSync(file);
    const data = JSON.stringify({
        type: "pdf",
        name: "Agreement 1",
        files: [
            {
                name: file.slice(file.indexOf("/")+1),
                content: fileBuffer.toString("base64"),
                digest: crypto.createHash("sha256").update(fileBuffer).digest("hex")
            }
        ],
        require_account: false,
        signers: [
            {
                email: email,
                name: "John",
                surname: "Doe",
            }
        ]
    });

    console.log("Sending a request...\n");

    const request = https.request({
        host: url,
        method: "POST",
        path: `/api/signing/create.json?access_token=${accessToken}`,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }, response => {
        let responseData = [];
        response.on('data', chunk => responseData.push(chunk)).on('end', function() {
            const {status, token, message} = JSON.parse(Buffer.concat(responseData).toString());
            
            if (status === "ok") {
                console.log(`Signing created successfully!`);
                console.log(`Check here: https://${url}/api/signing/${token}/status.json?access_token=${accessToken}\n`);
            } else if (status === "error" && message) {
                console.log(message);
            }
        });
    })

    request.write(data);
    request.end();
})();