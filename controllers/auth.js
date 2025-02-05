import { authsequelizeInstance } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

dotenv.config({ path: './.env' });

const OTP_EXPIRATION_TIME = process.env.OTP_EXPIRATION_TIME
const JWT_SECRET = process.env.JWT_SECRET_KEY;

let otps = {};

export const registerCompany = async (req, res) => {
    try {
        const sequelize = authsequelizeInstance();
       const {
        company_code,
        customer_type,
        company_name,
        email_id,
        city,
        state,
        owner_name,
        owner_mob,
        op_mob1,
        op_mob2,
        web_site,
        address,
        GST_NO,
        PAN_NO
       } = req.body;

       try {
        const __id = uuidv4();

        const query = `
            INSERT INTO Company (
                __id, company_code, customer_type, company_name, email_id, city, 
                state, owner_name, owner_mob, op_mob1, op_mob2, 
                web_site, address, GST_NO, PAN_NO
            )
            OUTPUT INSERTED.__id, INSERTED.company_code, INSERTED.customer_type, 
                    INSERTED.company_name, INSERTED.email_id, INSERTED.city, 
                    INSERTED.state, INSERTED.owner_name, INSERTED.owner_mob, 
                    INSERTED.op_mob1, INSERTED.op_mob2, INSERTED.web_site, 
                    INSERTED.address, INSERTED.GST_NO, INSERTED.PAN_NO
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const values = [
            __id, company_code, customer_type, company_name, email_id, city, 
            state, owner_name, owner_mob, op_mob1, op_mob2, 
            web_site, address, GST_NO, PAN_NO
        ];

        const [result] = await sequelize.query(query, {
            replacements: values,
            type: sequelize.QueryTypes.INSERT,  // Ensure it's an insert query
        });

        res.status(201).json({ 
            status: 201,
            success: true,
            data: result[0] });

       } catch (error) {
        console.log("Error fetching order details: ", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})
       }
       

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getComopanyList = async(req, res) => {
    try {
        const sequelize = authsequelizeInstance()
        const query = `SELECT * FROM Company;`;

        const results = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT
        })

        res.status(200).json({
            status: 200, 
            success: true, 
            count: results.length,
            data: results  
        })
    } catch (error) {
        console.log("Error fetching Company details: ", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})
    }
}

export const getCompanyDetailByID = async(req, res) => {
    try {
        const {__id} = req.params;
        const sequelize = authsequelizeInstance()

        const query = `
        SELECT u.*, s.*
        FROM Company u
        LEFT JOIN Software_detail s ON u.__id = s.user_id
        WHERE u.__id = :__id;
        `;

        const results = await sequelize.query(query, {
            replacements: {__id},
            type: sequelize.QueryTypes.SELECT
        })

        const companyDetails = results.reduce((acc, company) => {
            let companyData = acc.find(c => c.__id === company.user_id);
            if (!companyData) {
                companyData = {
                    __id: company.user_id,
                    company_code: company.company_code,
                    customer_type: company.customer_type,
                    company_name: company.company_name,
                    email_id: company.email_id,
                    city: company.city,
                    state: company.state,
                    owner_name: company.owner_name,
                    owner_mob: company.owner_mob,
                    op_mob1: company.op_mob1,
                    op_mob2: company.op_mob2,
                    web_site: company.web_site,
                    address: company.address,
                    GST_NO: company.GST_NO,
                    PAN_NO: company.PAN_NO,
                    softwares: []  // Initialize an empty array for software
                };
                acc.push(companyData);
            }

            // Software details from the Software_detail table
            if (company.software_code) {
                const software = {
                    __id: company.__id,
                    software_code: company.software_code,
                    software_type: company.software_type,
                    status: company.status,
                    register_status: company.register_status,
                    start_date: company.start_date,
                    end_date: company.end_date,
                    rate: company.rate,
                    rate_in: company.rate_in,
                    y_rate: company.y_rate,
                    application: company.application,
                    store: company.store,
                    data_password: company.data_password,
                    running_status: company.running_status,
                    temp_code: company.temp_code,
                    software_open_today: company.software_open_today,
                    instances: []  // Initialize an empty array for instances
                };
                companyData.softwares.push(software);
            }

            return acc;
        }, []);

        res.status(200).json({ 
            status: 200, 
            success: true, 
            count: companyDetails.length,
            data: companyDetails
        });

    } catch(error) {
        console.log("Error fetching Company detail: ", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})
    }
}

export const registerSoftware = async(req, res) => {
    try {
        const sequelize = authsequelizeInstance();
        const {
            software_code,
            software_type,
            status,
            register_status,
            start_date,
            end_date,
            rate,
            rate_in,
            y_rate,
            application,
            store,
            data_password,
            running_status,
            temp_code,
            software_open_today,
            user_id
            } = req.body;
        
        try {
            const __id = uuidv4();
            const query = `
           INSERT INTO Software_detail (
                __id, software_code, software_type, status, register_status, start_date, 
                end_date, rate, rate_in, y_rate, application, store, data_password, 
                running_status, temp_code, software_open_today, user_id
            )
            OUTPUT 
                INSERTED.__id, 
                INSERTED.software_code, 
                INSERTED.software_type, 
                INSERTED.status, 
                INSERTED.register_status, 
                INSERTED.start_date, 
                INSERTED.end_date, 
                INSERTED.rate, 
                INSERTED.rate_in, 
                INSERTED.y_rate, 
                INSERTED.application, 
                INSERTED.store, 
                INSERTED.data_password, 
                INSERTED.running_status, 
                INSERTED.temp_code, 
                INSERTED.software_open_today, 
                INSERTED.user_id
            VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            );
            `;

            const values = [
                __id, software_code, software_type, status, register_status, start_date,
                end_date, rate, rate_in, y_rate, application, store, data_password,
                running_status, temp_code, software_open_today, user_id
            ]

            const [result] = await sequelize.query(query, {
                replacements: values,
                type: sequelize.QueryTypes.INSERT,  // Ensure it's an insert query
            });

            res.status(201).json({ 
                status: 201,
                success: true, 
                data: result[0] });

        } catch (error) {
            console.log("Error Registering Software: ", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})   
        }
        
    } catch (error) {
        console.log("Error Registering Software: ", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})
    }
}

export const updateSoftwareDetails = async(req, res) => {
    try{
        const {__id} = req.params;
        const sequelize = authsequelizeInstance();
        const {
            software_code,
            software_type,
            status,
            register_status,
            start_date,
            end_date,
            rate,
            rate_in,
            y_rate,
            application,
            store,
            data_password,
            running_status,
            temp_code,
            software_open_today,
            user_id
            } = req.body;

        const query = `
            UPDATE Software_detail
            SET
                software_code = :software_code,
                software_type = :software_type,
                status = :status,
                register_status = :register_status,
                start_date = :start_date,
                end_date = :end_date,
                rate = :rate,
                rate_in = :rate_in,
                y_rate = :y_rate,
                application = :application,
                store = :store,
                data_password = :data_password,
                running_status = :running_status,
                temp_code = :temp_code,
                software_open_today = :software_open_today,
                user_id = :user_id
            WHERE __id = :__id
        `;

        const [result] = await sequelize.query(query, {
            replacements: {
                software_code,
                software_type,
                status,
                register_status,
                start_date,
                end_date,
                rate,
                rate_in,
                y_rate,
                application,
                store,
                data_password,
                running_status,
                temp_code,
                software_open_today,
                user_id,
                __id
            },
            type: sequelize.QueryTypes.UPDATE
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Software details not found or no changes made"
            });
        }

        // If update was successful, send a success response
        res.status(200).json({
            status: 200,
            success: true,
            message: "Software details updated successfully"
        });
        
    } catch (error) {
        console.log("Error Updating Software Details: ", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})
    }

}

export const requestOTP = async(req, res) => {
    const {phone_no} = req.body;

    const otp = "123456";
    const expirationTime = Date.now() + OTP_EXPIRATION_TIME * 60000; // OTP expiry in minutes
    otps[phone_no] = { otp, expirationTime };

    try{
        res.status(200).json({
            status: 200,
            success: true,
            message: "OTP Send Successfully",
            OTP: otp
        });
    } catch(error) {
        console.log("Error Sending OTP: ", error);
        res.status(500).json({status: 500, success: false, message: "Error sending OTP"})
    }
}

export const verifyOTP = async(req, res) => {
    const {phone_no, otp} = req.body;

    if(!otps[phone_no] || otps[phone_no].otp !== otp){
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Invalid OTP"
        })
    }

    if(Date.now() > otps[phone_no].expirationTime) {
        delete otps[phone_no];
        return res.status(400).json({
            status: 400,
            success: false,
            message: "OTP Expired"
        })
    }

    const token = jwt.sign({phone_no}, JWT_SECRET, {expiresIn: '1h'});

    delete otps[phone_no];

    return res.status(200).json({
        status: 200,
        success: true,
        data: token
    })
}

export const registerApplication = async(req, res) => {
    try {
        const sequelize = authsequelizeInstance();
        const {
            software_code,
            server_name,
            data_path,
            db_name,
            username,
            password,
            software_id
        } = req.body;

        try {
            const __id = uuidv4();

            const uniqueString = `${software_code}-${server_name}-${data_path}-${db_name}-${username}-${software_id}`;
            const uniqueCode = crypto.createHash('sha256').update(uniqueString).digest('hex').substring(0, 6);  // Take first 10 chars as code

            const query = `
            INSERT INTO software_instance (
            __id, software_code, server_name, data_path, db_name, username, password, software_id, code
            ) 
            OUTPUT INSERTED.__id, INSERTED.software_code, INSERTED.server_name, INSERTED.data_path, INSERTED.db_name, INSERTED.username, INSERTED.password, INSERTED.software_id, INSERTED.code
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                __id, software_code, server_name, data_path, db_name, username, password, software_id, uniqueCode
            ]

            const [result] = await sequelize.query(query, {
                replacements: values,
                type: sequelize.QueryTypes.INSERT,  // Ensure it's an insert query
            });

            res.status(201).json({ 
                status: 201,
                success: true,
                data: result[0] });

        } catch (error) {
            console.error("Error registering Application:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    } catch (error) {
        console.error("Error registering Application:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const applicationLogin = async(req, res) => {
    try {
        const sequelize = authsequelizeInstance();
        const {company_code, username, password} = req.body;
        
        const query = `
        SELECT 
            c.company_code,
            si.__id,
            si.username,
            si.password
        FROM 
            Company c
        JOIN 
            Software_detail sd ON c.__id = sd.user_id
        JOIN 
            Software_instance si ON sd.__id = si.software_id
        `;

        const results = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT
        })

        if(results.length > 0){
            const result = results[0];

            if(result.company_code === company_code &&
                result.username === username &&
                result.password === password
            ) {
                const token = jwt.sign({company_code, username, password}, JWT_SECRET, {expiresIn: '1h'});
                return res.status(200).json({
                    status: 200,
                    success: true,
                    software_id: result.__id,
                    data: token
                })
            } else {
                res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'Invalid credentials or company code'
                });
            }
        } else {
            res.status(404).json({
                status: 404,
                success: false,
                message: 'No matching records found'
            });
        }
    } catch(error) {
        console.error("Error Login User:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}