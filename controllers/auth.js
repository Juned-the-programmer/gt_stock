import { authsequelizeInstance } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Sequelize from "sequelize";

dotenv.config({ path: './.env' });

const OTP_EXPIRATION_TIME = process.env.OTP_EXPIRATION_TIME
const JWT_SECRET = process.env.JWT_SECRET_KEY;

let otps = {};
export const userConnections = new Map();

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
        console.log("Error Registering Company: ", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})
       }
       

    } catch (error) {
        console.error("Error Registering Company:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getComopanyList = async(req, res) => {
    try {
        const sequelize = authsequelizeInstance()
        const query = `SELECT __id, 
        company_code, customer_type, 
        company_name, email_id, 
        city, state, owner_name, 
        owner_mob, op_mob1, op_mob2, 
        web_site, address, 
        GST_NO, PAN_NO 
        FROM Company;`;

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
        SELECT 
            CO.__id, 
            CO.company_code, 
            CO.customer_type, 
            CO.company_name, 
            CO.email_id, 
            CO.city, 
            CO.state, 
            CO.owner_name, 
            CO.owner_mob, 
            CO.op_mob1, 
            CO.op_mob2, 
            CO.web_site, 
            CO.address, 
            CO.GST_NO, 
            CO.PAN_NO, 
            SD.__id AS software_id, 
            SD.software_code, 
            SD.software_type, 
            SD.status AS software_status, 
            SD.register_status, 
            SD.start_date, 
            SD.end_date, 
            SD.rate, 
            SD.rate_in, 
            SD.y_rate, 
            SD.application, 
            SD.store, 
            SD.data_password, 
            SD.running_status, 
            SD.temp_code, 
            SD.software_open_today
        FROM Company CO
        LEFT JOIN Software_detail SD ON CO.__id = SD.company_id
        WHERE CO.__id = :__id;`;

        const results = await sequelize.query(query, {
            replacements: {__id},
            type: sequelize.QueryTypes.SELECT
        })

        const companyDetails = results.reduce((acc, company) => {
            let companyData = acc.find(c => c.__id === company.__id);
            if (!companyData) {
                companyData = {
                    __id: company.__id,
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
                    __id: company.software_id,
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
                    software_open_today: company.software_open_today
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
            db_server_name,
            data_path,
            db_name,
            db_username,
            db_password,
            store,
            store_server_name,
            store_data_path,
            store_db_name,
            store_db_username,
            store_db_password,
            data_password,
            running_status,
            temp_code,
            software_open_today,
            company_id
            } = req.body;
        
        try {
            const __id = uuidv4();
            const query = `
           INSERT INTO Software_detail (
                __id, software_code, software_type, status, register_status, start_date, 
                end_date, rate, rate_in, y_rate, application, store, data_password, 
                running_status, temp_code, software_open_today, company_id
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
                INSERTED.company_id
            VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            );
            `;

            const values = [
                __id, software_code, software_type, status, register_status, start_date,
                end_date, rate, rate_in, y_rate, application, store, data_password,
                running_status, temp_code, software_open_today, company_id
            ]

            const [result] = await sequelize.query(query, {
                replacements: values,
                type: sequelize.QueryTypes.INSERT,
            });

            // Add Software Instance
            if(application === true){
                const uniqueString = `${software_code}-${db_server_name}-${data_path}-${db_name}-${db_username}-${result[0].__id}`.toUpperCase();
                const uniqueCode = crypto.createHash('sha256').update(uniqueString).digest('hex').substring(0, 6);
                const __id = uuidv4();
                const application_query=`
                INSERT INTO Software_instance(
                __id, software_code, db_server_name,  data_path, db_name, db_username, db_password, software_id, code)
                VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?
                );
                `;

                const application_values = [
                    __id, software_code, db_server_name, data_path, db_name, db_username, db_password, result[0].__id, uniqueCode
                ]

                const application_register = await sequelize.query(application_query, {
                    replacements: application_values,
                    type: sequelize.QueryTypes.INSERT,
                })

                const createDbQuery = `
                    IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = ?) 
                    BEGIN
                        EXEC('CREATE DATABASE ' + ?);
                    END
                    `;
                await sequelize.query(createDbQuery, {
                    replacements: [db_name, db_name],
                    type: sequelize.QueryTypes.RAW,
                });
            } 
            // Add Store Instance
            if(store === true){
                const uniqueString = `${software_code}-${store_server_name}-${store_data_path}-${store_db_name}-${store_db_username}-${result[0].__id}`.toUpperCase();
                const uniqueCode = crypto.createHash('sha256').update(uniqueString).digest('hex').substring(0, 6);
                const __id = uuidv4();
                const store_query=`
                INSERT INTO store_instance(
                __id, software_code, db_server_name,  data_path, db_name, db_username, db_password, software_id, code)
                VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?
                );
                `;

                const store_values = [
                    __id, software_code, store_server_name, store_data_path, store_db_name, store_db_username, store_db_password, result[0].__id, uniqueCode
                ]

                const store_register = await sequelize.query(store_query, {
                    replacements: store_values,
                    type: sequelize.QueryTypes.INSERT,
                })
            }

            res.status(201).json({ 
                status: 201,
                success: true, 
                data: result[0] 
            });

        } catch (error) {
            console.log("Error Registering Software: ", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})   
        }
        
    } catch (error) {
        console.log("Error Registering Software: ", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})
    }
}

export const getSoftwareDetailById = async(req, res) => {
    try {
        const {__id} = req.params;
        console.log(__id);
        const sequelize = authsequelizeInstance()
        const query=`
        SELECT SD.__id, SD.software_code, SD.software_type, SD.register_status, SD.start_date, SD.end_date, SD.rate, SD.rate_in, SD.y_rate, 
        SD.application, SD.store, sd.data_password, SD.running_status, SD.temp_code, SD.software_open_today, SD.company_id, C.company_name,
        SI.__id AS software_instance_id, 
        SI.software_code AS software_instance_software_code, 
        SI.db_server_name AS software_instance_server_name, 
        SI.data_path AS sofwtare_instatnce_data_path, 
        SI.db_name AS sofwtare_instance_db_name, 
        SI.db_username AS sofwtare_instance_db_username, 
        SI.db_password AS software_instance_db_password, 
        SI.code AS software_instance_code,
        STI.__ID AS store_instance_id, 
        STI.software_code AS store_instance_software_code, 
        STI.db_server_name AS store_instance_server_name, 
        STI.data_path AS store_instance_data_path, 
        STI.db_name AS store_instance_db_name, 
        STI.db_username AS store_instance_db_usernam , 
        STI.db_password AS store_instance_db_password, 
        STI.code AS store_instance_code 
        from Software_detail SD
        LEFT JOIN software_instance SI ON SI.software_id = SD.__id
        LEFT JOIN store_instance STI ON STI.software_id = SD.__id
        LEFT JOIN Company C ON C.__id = SD.company_id
        WHERE 
        SD.__id = :__id;
        `;

        const results = await sequelize.query(query, {
            replacements: {__id},
            type: sequelize.QueryTypes.SELECT
        })

        res.status(200).json({ 
            status: 200, 
            success: true, 
            count: results.length,
            data: results
        });

    } catch(error) {
        console.log("Error Retreiving Software Details: ", error);
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
            company_id
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
                company_id = :company_id
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
                company_id,
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

export const addUserRole = async(req, res) => {
    try{
        const sequelize = authsequelizeInstance();
        const {
            role,
            reference_id,
            firmname,
            person_name,
            city,
            state,
            type,
            looking_for,
            mob_1,
            password_1,
            mob_2,
            password_2,
            mob_3,
            password_3,
            mob_4,
            password_4,
            active_status,
            software_id
        } = req.body;
        try{
            const __id = uuidv4();
            const first_login = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const query=`INSERT INTO users(
            __id, Role, Reference_id, FirmName, Person_name, city, state, type, looking_for, Mob_1, password_1, Mob_2, password_2, Mob_3, password_3,
            Mob_4, password_4, active_status, first_login, otp_verified, software_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
            `;

            const values = [
                __id, role, reference_id, firmname, person_name, city, state, type, looking_for, mob_1, password_1, mob_2, password_2, mob_3, password_3,
                mob_4, password_4, active_status, first_login, 0, software_id
            ] 

            const result = await sequelize.query(query, {
                replacements: values,
                type: sequelize.QueryTypes.INSERT,
            })

            res.status(201).json({ 
                status: 201,
                success: true,
                data: "User Registerd Successfully"
            });

        } catch (error) {
            console.log("Error Adding USER role: ", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})
        }
    } catch(error) {
        console.log("Error Adding USER role: ", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})
    }
}

export const getListUsersBysoftwareId = async(req, res) => {
    try {
        const {__id} = req.params;
        const sequelize = authsequelizeInstance();
        const query = 
        `select 
            U.__id, U.Role, U.Reference_id, U.FirmName, U.Person_name, U.city, U.state, 
            U.type, U.looking_for, 
            U.Mob_1, U.password_1, 
            U.Mob_2, U.password_2, 
            U.Mob_3, U.password_3,
            U.Mob_4, U.password_4, 
            U.active_status, U.first_login, U.otp_verified
        from 
            users U
        WHERE
            software_id = :__id;`;

        const results = await sequelize.query(query, {
            replacements: {__id},
            type: sequelize.QueryTypes.SELECT
        })

        res.status(200).json({ 
            status: 200, 
            success: true, 
            count: results.length,
            data: results
        });

    } catch (error) {
        console.log("Error Retreving USER role: ", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})
    }
}

export const getUserDetailById = async(req, res) => {
    try {
        const {__id} = req.params;
        const sequelize = authsequelizeInstance();
        const query = 
        `select 
            U.__id, U.Role, U.Reference_id, U.FirmName, U.Person_name, U.city, U.state, 
            U.type, U.looking_for, 
            U.Mob_1, U.password_1, 
            U.Mob_2, U.password_2, 
            U.Mob_3, U.password_3,
            U.Mob_4, U.password_4, 
            U.active_status, U.first_login, U.otp_verified
        from 
            users U
        WHERE
            __id = :__id;`;
        
        const results = await sequelize.query(query, {
            replacements: {__id},
            type: sequelize.QueryTypes.SELECT
        })

        res.status(200).json({ 
            status: 200, 
            success: true, 
            count: results.length,
            data: results
        });
    
    } catch(error) {
        console.log("Error Retreving USER role: ", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})
    }
}

export const updateUserDetail = async(req, res) => {
    try {
        const sequelize = authsequelizeInstance();
        const {__id} = req.params;
        const {
            role,
            reference_id,
            firmname,
            person_name,
            city,
            state,
            type,
            looking_for,
            mob_1,
            password_1,
            mob_2,
            password_2,
            mob_3,
            password_3,
            mob_4,
            password_4,
            active_status
        } = req.body;
        try {
            const query = `
            UPDATE users 
            SET
                Role = :role,
                Reference_id = :reference_id,
                FirmName = :firmname,
                Person_Name = :person_name,
                city = :city,
                state = :state,
                type = :type,
                looking_for = :looking_for,
                Mob_1 = :mob_1,
                password_1 = :password_1,
                Mob_2 = :mob_2,
                password_2 = :password_2,
                Mob_3 = :mob_3,
                password_3 = :password_3,
                Mob_4 = :mob_4,
                password_4 = :password_4,
                active_status = :active_status
            WHERE
            __id = :__id
            `;

            const [result] = await sequelize.query(query, {
                replacements: {
                    role,
                    reference_id,
                    firmname,
                    person_name,
                    city,
                    state,
                    type,
                    looking_for,
                    mob_1,
                    password_1,
                    mob_2,
                    password_2,
                    mob_3,
                    password_3,
                    mob_4,
                    password_4,
                    active_status,
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
                message: "User details updated successfully"
            });

        } catch(error) {
            console.log("Error updating USER role: ", error);
            res.status(500).json({status: 500, success: false, message: "Internal Server Error"})
        }
    } catch(error) {
        console.log("Error updating USER role: ", error);
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

export const applicationLogin = async(req, res) => {
    try {
        const authsequelize = authsequelizeInstance();
        let sequelize; 
        const {company_code, mobile_no, password} = req.body;
        
        const query = `
        SELECT 
            C.company_code,
            SD.__id AS software_id,
            SI.db_name,
            SI.db_server_name,
            SI.db_username,
            SI.db_password,
            U.Role,
            U.Mob_1,
            U.password_1,
            U.Mob_2,
            U.password_2,
            U.Mob_3,
            U.password_3,
            U.Mob_4,
            U.password_4,
            U.active_status,
            U.otp_verified
        FROM 
            company C
        JOIN 
            software_detail SD ON C.__id = SD.company_id
        JOIN
            software_instance SI ON SD.__id = SI.software_id
        JOIN 
            users U ON SD.__id = U.software_id
        WHERE 
            C.company_code = :company_code;
        `;

        const results = await authsequelize.query(query, {
            replacements: {company_code},
            type: authsequelize.QueryTypes.SELECT
        })
        if(results.length > 0){
            for(let user of results) {
                if(user.company_code === company_code && user.active_status === true &&
                        (user.Mob_1 === mobile_no && user.password_1 === password) ||
                        (user.Mob_2 === mobile_no && user.password_2 === password) ||
                        (user.Mob_3 === mobile_no && user.password_3 === password) ||
                        (user.Mob_4 === mobile_no && user.password_4 === password)
                ) {
                    const token = jwt.sign({company_code, mobile_no, password}, JWT_SECRET, {expiresIn: '1h'});
                    if (!sequelize) {
                        sequelize = new Sequelize(user.db_name, user.db_username, user.db_password, {
                            host: user.db_server_name,
                            dialect: 'mssql'
                        });
                
                        try {
                            await sequelize.authenticate();
                            console.log('Database connected successfully.');
                        } catch (error) {
                            console.error('Unable to connect to the database:', error);
                        }
                    }
                    userConnections.set(token, {sequelize: sequelize, lastUsed: Date.now()});
                    return res.status(200).json({
                        status: 200,
                        success: true,
                        user_id: user.software_id,
                        role: user.Role,
                        data: token
                    })
                } 
            }
            res.status(400).json({
                status: 400,
                success: false,
                message: 'Invalid credentials or company code'
            });
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

export const applicationLogout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: 'Unauthorized: No token provided'
            });
        }
        
        // Remove the connection associated with this token
        if (userConnections.has(token)) {
            const connection = userConnections.get(token);
            await connection.sequelize.close(); // Close the database connection
            userConnections.delete(token);
        }
        
        res.status(200).json({
            status: 200,
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Error Logging Out:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};