import { authsequelizeInstance } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

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

        const userDetails = results.reduce((acc, user) => {
            let userData = acc.find(u => u.__id === user.user_id );
            if(!userData) {
                userData = {
                    __id: user.user_id,
                    company_code: user.company_code,
                    customer_type: user.customer_type,
                    company_name: user.company_name,
                    email_id: user.email_id,
                    city: user.city,
                    state: user.state,
                    owner_name: user.owner_name,
                    owner_mob: user.owner_mob,
                    op_mob1: user.op_mob1,
                    op_mob2: user.op_mob2,
                    web_site: user.web_site,
                    address: user.address,
                    GST_NO: user.GST_NO,
                    PAN_NO: user.PAN_NO,
                    softwares: []  // Initialize an empty array for software
                };
                acc.push(userData)
            }
            if(user.software_code){
                userData.softwares.push({
                    __id: user.__id,
                    software_code: user.software_code,
                    software_type: user.software_type,
                    status: user.status,
                    register_status: user.register_status,
                    start_date: user.start_date,
                    end_date: user.end_date,
                    rate: user.rate,
                    rate_in: user.rate_in,
                    y_rate: user.y_rate,
                    application: user.application,
                    store: user.store,
                    data_password: user.data_password,
                    running_status: user.running_status,
                    temp_code: user.temp_code,
                    software_open_today: user.software_open_today
                });
            }
            return acc;
        }, []);

        res.status(200).json({ 
            status: 200, 
            success: true, 
            count: userDetails.length,
            data: userDetails
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

