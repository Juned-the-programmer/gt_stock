import { getSequelizeInstance } from '../db.js';

export const getDataList = async (req, res) => {
    try {
        const { search } = req.query;
        const sequelize = getSequelizeInstance();

        //     const query = `
        //     SELECT 
        //         DesignName.DesignName, 
        //         Shade.ShName, 
        //         SizeName.SizeName, 
        //         CatName.CatName, 
        //         SUM(SubDesign.G1) AS SumOfG1
        //     FROM 
        //         (((DesignName 
        //         INNER JOIN SubDesign ON DesignName.GenCode = SubDesign.GenCode) 
        //         INNER JOIN SizeName ON DesignName.SizeCode = SizeName.SizeCode) 
        //         INNER JOIN CatName ON DesignName.CatCode = CatName.CatCode) 
        //         INNER JOIN Shade ON SubDesign.ShCode = Shade.ShCode
        //     ${searchCondition}
        //     GROUP BY 
        //         DesignName.DesignName, 
        //         Shade.ShName, 
        //         SizeName.SizeName, 
        //         CatName.CatName, 
        //         DesignName.GenCode
        //     HAVING 
        //         SUM(SubDesign.G1) != 0;
        // `;

        const query = `
        -- Declare variables
        DECLARE @v_GenCode NVARCHAR(50),
                @v_ShCode NVARCHAR(50),
                @v_DesignName NVARCHAR(100),
                @v_CatName NVARCHAR(100),
                @v_ShName NVARCHAR(100),
                @v_SizeName NVARCHAR(100),
                @v_BrandName NVARCHAR(100),
                @v_SeriesName NVARCHAR(100),
                @v_FGName NVARCHAR(100),
                @v_DTName NVARCHAR(100),
                @v_DSName NVARCHAR(100),
                @v_PcsBox INT,
                @v_BtBoxWt DECIMAL(18, 2),
                @v_SqFeet NVARCHAR(100),
                @v_SqMtr NVARCHAR(100),
                @v_DesignAct NVARCHAR(100),
                @v_BPName NVARCHAR(100),
                @v_G1 DECIMAL(10, 2),
                @v_G2 DECIMAL(10, 2),
                @v_G3 DECIMAL(10, 2),
                @v_G4 DECIMAL(10, 2),
                @v_G5 DECIMAL(10, 2),
                @v_Gtot DECIMAL(10, 2),
                @v_OQ1 DECIMAL(10, 2),
                @v_OQ2 DECIMAL(10, 2),
                @v_OQ3 DECIMAL(10, 2),
                @v_OQ4 DECIMAL(10, 2),
                @v_OQ5 DECIMAL(10, 2),
                @v_OQtot DECIMAL(10, 2),
                @v_AOQ1 DECIMAL(10, 2),
                @v_AOQ2 DECIMAL(10, 2),
                @v_AOQ3 DECIMAL(10, 2),
                @v_AOQ4 DECIMAL(10, 2),
                @v_AOQ5 DECIMAL(10, 2),
                @v_AOQtot DECIMAL(10, 2),
                @v_SumOfG1 DECIMAL(10, 2),
                @v_PfCode NVARCHAR(50),
                @v_OrderQty DECIMAL(10, 2),
                @v_CurrStockQty DECIMAL(10, 2),
                @v_AfterOrderQty DECIMAL(10, 2),
                @searchCondition NVARCHAR(100);
        
        -- Set search condition
        SET @searchCondition = :searchCondition;
        
        -- Create temporary table
        CREATE TABLE #TempTable (
            GenCode NVARCHAR(50),
            ShCode NVARCHAR(50),
            DesignName NVARCHAR(100),
            CatName NVARCHAR(100),
            ShName NVARCHAR(100),
            SizeName NVARCHAR(100),
            BrandName NVARCHAR(100),
            SeriesName NVARCHAR(100),
            FGName NVARCHAR(100),
            DTName NVARCHAR(100),
            DSName NVARCHAR(100),
            PcsBox INT,
            BtBoxWt DECIMAL(18, 2),
            SqFeet NVARCHAR(100),
            SqMtr NVARCHAR(100),
            DesignAct NVARCHAR(100),
            BPName NVARCHAR(100),
            G1 DECIMAL(18, 2),
            G2 DECIMAL(18, 2),
            G3 DECIMAL(18, 2),
            G4 DECIMAL(18, 2),
            G5 DECIMAL(18, 2),
            Gtot DECIMAL(18, 2),
            OQ1 DECIMAL(18, 2),
            OQ2 DECIMAL(18, 2),
            OQ3 DECIMAL(18, 2),
            OQ4 DECIMAL(18, 2),
            OQ5 DECIMAL(18, 2),
            OQtot DECIMAL(18, 2),
            AOQ1 DECIMAL(18, 2),
            AOQ2 DECIMAL(18, 2),
            AOQ3 DECIMAL(18, 2),
            AOQ4 DECIMAL(18, 2),
            AOQ5 DECIMAL(18, 2),
            AOQtot DECIMAL(18, 2),
            SumOfG1 DECIMAL(18, 2)
        );
        
        -- Define cursor
        DECLARE cur CURSOR FOR
        SELECT
            SubDesign.GenCode,
            SubDesign.ShCode,
            DesignName.DesignName,
            CatName.CatName,
            Shade.ShName,
            SizeName.SizeName,
            MIN(BrandName.BrandName) AS FirstOfBrandName,
            MIN(SeriesName.SeriesName) AS FirstOfSeriesName,
            MIN(FinishGlaze.FGName) AS FirstOfFGName,
            MIN(DesignType.DTName) AS FirstOfDTName,
            MIN(DesignStatus.DSName) AS FirstOfDSName,
            MIN(SizeName.PcsBox) AS FirstOfPcsBox,
            MIN(SubDesign.BtBoxWt) AS FirstOfBtBoxWt,
            MIN(SizeName.SqFeet) AS FirstOfSqFeet,
            MIN(SizeName.SqMtr) AS FirstOfSqMtr,
            MIN(DesignName.DesignAct) AS FirstOfDesignAct,
            MIN(BPName.BPName) AS FirstOfBPName,
            SUM(SubDesign.G1) AS G1,
            SUM(SubDesign.G2) AS G2,
            SUM(SubDesign.G3) AS G3,
            SUM(SubDesign.G4) AS G4,
            SUM(SubDesign.G5) AS G5,
            SUM(SubDesign.Gtot) AS Gtot,
            SUM(SubDesign.OQ1) AS OQ1,
            SUM(SubDesign.OQ2) AS OQ2,
            SUM(SubDesign.OQ3) AS OQ3,
            SUM(SubDesign.OQ4) AS OQ4,
            SUM(SubDesign.OQ5) AS OQ5,
            SUM(SubDesign.OQtot) AS OQtot,
            SUM(SubDesign.AOQ1) AS AOQ1,
            SUM(SubDesign.AOQ2) AS AOQ2,
            SUM(SubDesign.AOQ3) AS AOQ3,
            SUM(SubDesign.AOQ4) AS AOQ4,
            SUM(SubDesign.AOQ5) AS AOQ5,
            SUM(SubDesign.AOQtot) AS AOQtot,
            SUM(SubDesign.G1) AS SumOfG1
        FROM
            SubDesign
            INNER JOIN DesignName ON SubDesign.GenCode = DesignName.GenCode
            INNER JOIN SizeName ON DesignName.SizeCode = SizeName.SizeCode
            INNER JOIN Shade ON SubDesign.ShCode = Shade.ShCode
            INNER JOIN BrandName ON DesignName.BrandCode = BrandName.BrandCode
            INNER JOIN SeriesName ON DesignName.SeriesCode = SeriesName.SeriesCode
            INNER JOIN FinishGlaze ON DesignName.FGCode = FinishGlaze.FGCode
            INNER JOIN DesignType ON DesignName.DTCode = DesignType.DTCode
            INNER JOIN DesignStatus ON DesignName.DSCode = DesignStatus.DSCode
            INNER JOIN BPName ON DesignName.BPCode = BPName.BPCode
            INNER JOIN CatName ON DesignName.CatCode = CatName.CatCode
        WHERE
            SubDesign.Gtot <> 0
            AND DesignName.DesignName LIKE @searchCondition
        GROUP BY
            SubDesign.GenCode, SubDesign.ShCode, DesignName.DesignName, CatName.CatName, Shade.ShName, SizeName.SizeName;
        
        -- Open cursor
        OPEN cur;
        FETCH NEXT FROM cur INTO
            @v_GenCode, @v_ShCode, @v_DesignName, @v_CatName, @v_ShName, @v_SizeName,
            @v_BrandName, @v_SeriesName, @v_FGName, @v_DTName, @v_DSName, @v_PcsBox,
            @v_BtBoxWt, @v_SqFeet, @v_SqMtr, @v_DesignAct, @v_BPName,
            @v_G1, @v_G2, @v_G3, @v_G4, @v_G5, @v_Gtot,
            @v_OQ1, @v_OQ2, @v_OQ3, @v_OQ4, @v_OQ5, @v_OQtot,
            @v_AOQ1, @v_AOQ2, @v_AOQ3, @v_AOQ4, @v_AOQ5, @v_AOQtot,
            @v_SumOfG1;
        
        -- Process each row
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Insert into temp table
            INSERT INTO #TempTable
            (GenCode, ShCode, DesignName, CatName, ShName, SizeName, BrandName, SeriesName, FGName, DTName, DSName, PcsBox, BtBoxWt, SqFeet, SqMtr, DesignAct, BPName, G1, G2, G3, G4, G5, Gtot, OQ1, OQ2, OQ3, OQ4, OQ5, OQtot, AOQ1, AOQ2, AOQ3, AOQ4, AOQ5, AOQtot, SumOfG1)
            VALUES
            (@v_GenCode, @v_ShCode, @v_DesignName, @v_CatName, @v_ShName, @v_SizeName,
             @v_BrandName, @v_SeriesName, @v_FGName, @v_DTName, @v_DSName, @v_PcsBox,
             @v_BtBoxWt, @v_SqFeet, @v_SqMtr, @v_DesignAct, @v_BPName,
             @v_G1, @v_G2, @v_G3, @v_G4, @v_G5, @v_Gtot,
             @v_OQ1, @v_OQ2, @v_OQ3, @v_OQ4, @v_OQ5, @v_OQtot,
             @v_AOQ1, @v_AOQ2, @v_AOQ3, @v_AOQ4, @v_AOQ5, @v_AOQtot, @v_SumOfG1);
        
            FETCH NEXT FROM cur INTO
                @v_GenCode, @v_ShCode, @v_DesignName, @v_CatName, @v_ShName, @v_SizeName,
                @v_BrandName, @v_SeriesName, @v_FGName, @v_DTName, @v_DSName, @v_PcsBox,
                @v_BtBoxWt, @v_SqFeet, @v_SqMtr, @v_DesignAct, @v_BPName,
                @v_G1, @v_G2, @v_G3, @v_G4, @v_G5, @v_Gtot,
                @v_OQ1, @v_OQ2, @v_OQ3, @v_OQ4, @v_OQ5, @v_OQtot,
                @v_AOQ1, @v_AOQ2, @v_AOQ3, @v_AOQ4, @v_AOQ5, @v_AOQtot,
                @v_SumOfG1;
        END;
        
        -- Close and deallocate cursor
        CLOSE cur;
        DEALLOCATE cur;
        
        -- Return results
        SELECT * FROM #TempTable;
        
        -- Drop temp table
        DROP TABLE #TempTable;
        `;

        const searchString = `%${search}%`; // Replace with the actual search term
        const results = await sequelize.query(query, {
            replacements: { searchCondition: searchString },
            type: sequelize.QueryTypes.SELECT,
        });

        const grQuery = `
        SELECT * FROM GrName;
        `;

        const grResult = await sequelize.query(grQuery, {
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({ status: 200, success: true, count: results.length, data: { results, grResult } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

export const getDetails = async (req, res) => {
    try {
        const { search } = req.query;
        const sequelize = getSequelizeInstance();

        

        const query = `
            SELECT BrandName.BrandName, CatName.CatName, GrName.GrName, DesignName.DesignName, DesignName.G1, DesignName.G2, DesignName.G3, DesignName.G4, DesignName.OQ1, DesignName.OQ2, DesignName.OQ3, DesignName.OQ4, DesignName.AOQ1, DesignName.AOQ2, DesignName.AOQ3, DesignName.AOQ4
            FROM GrName, (DesignName INNER JOIN BrandName ON DesignName.BrandCode = BrandName.BrandCode) INNER JOIN CatName ON DesignName.CatCode = CatName.CatCode;
        `;

        const results = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({ status: 200, success: true, count: results.length, data: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

export const stockDetails = async (req, res) => {
    try {
        const { gencode } = req.params;
        const sequelize = getSequelizeInstance();

        const query = `
           SELECT
    BN.BrandName                     AS BrandName,
    COUNT(*)                         AS TotalRows,
    SUM(SD.G1)                       AS TotalG1,
    SUM(SD.G2)                       AS TotalG2,
    SUM(SD.G3)                       AS TotalG3,
    SUM(SD.G4)                       AS TotalG4,
    SUM(SD.AOQ1)                     AS TotalAOQ1,
    SUM(SD.AOQ2)                     AS TotalAOQ2,
    SUM(SD.AOQ3)                     AS TotalAOQ3,
    SUM(SD.AOQ4)                     AS TotalAOQ4
FROM 
    SubDesign        SD
    INNER JOIN DesignName   DN  ON SD.GenCode   = DN.GenCode
    INNER JOIN BrandName    BN  ON DN.BrandCode = BN.BrandCode
    INNER JOIN Shade        SH  ON SD.ShCode    = SH.ShCode
    INNER JOIN LocName      LN  ON SD.LcCode    = LN.LcCode
    INNER JOIN MfgStatus    MS  ON SD.MsCode    = MS.MsCode
    INNER JOIN Batch        BT  ON SD.BtCode    = BT.BtCode
WHERE
    SD.GenCode = :gencode
    AND BT.BtName <> 'ZX'          -- Changed the condition to filter by BtName
GROUP BY
    BN.BrandName;
        `;

        const results = await sequelize.query(query, {
            replacements: { gencode },
            type: sequelize.QueryTypes.SELECT,
        });

        const boxPackQuery = `
            SELECT
    Shade.ShName,
    SUM(SubDesign.G1)      AS SumG1,
    SUM(SubDesign.G2)      AS SumG2,
    SUM(SubDesign.G3)      AS SumG3,
    SUM(SubDesign.G4)      AS SumG4,
    SUM(SubDesign.Gtot)    AS SumGtot,      -- if needed
    SUM(SubDesign.AOQ1)    AS SumAOQ1,
    SUM(SubDesign.AOQ2)    AS SumAOQ2,
    SUM(SubDesign.AOQ3)    AS SumAOQ3,
    SUM(SubDesign.AOQ4)    AS SumAOQ4,
    SUM(SubDesign.AOQtot)  AS SumAOQtot     -- if needed
FROM 
    (
        (
            (
                (
                    BrandName
                    INNER JOIN 
                        (
                            SubDesign
                            INNER JOIN DesignName 
                                ON SubDesign.GenCode = DesignName.GenCode
                        )
                    ON BrandName.BrandCode = DesignName.BrandCode
                )
                INNER JOIN Shade 
                    ON SubDesign.ShCode = Shade.ShCode
            )
            INNER JOIN LocName 
                ON SubDesign.LcCode = LocName.LcCode
        )
        INNER JOIN MfgStatus 
            ON SubDesign.MsCode = MfgStatus.MsCode
    )
    INNER JOIN Batch 
        ON SubDesign.BtCode = Batch.BtCode
WHERE
    SubDesign.GenCode = :gencode
    AND Batch.BtName <> 'ZX'
GROUP BY
    Shade.ShName
ORDER BY
    Shade.ShName;
        `;

        const boxResults = await sequelize.query(boxPackQuery, {
            replacements: { gencode },
            type: sequelize.QueryTypes.SELECT,
        });


        res.status(200).json({ status: 200, success: true, count: results.length, data: results, boxResults });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

export const stockDetailsWithBatchAndManufacturing = async (req, res) => {
    try {
        const { gencode, shname } = req.params;
        const sequelize = getSequelizeInstance();

        const query = `
           SELECT 
    Batch.BtName,
    MfgStatus.MsName,
    SUM(SubDesign.G1)      AS SumG1,
    SUM(SubDesign.G2)      AS SumG2,
    SUM(SubDesign.G3)      AS SumG3,
    SUM(SubDesign.G4)      AS SumG4,
    SUM(SubDesign.Gtot)    AS SumGtot,     -- if needed
    SUM(SubDesign.AOQ1)    AS SumAOQ1,
    SUM(SubDesign.AOQ2)    AS SumAOQ2,
    SUM(SubDesign.AOQ3)    AS SumAOQ3,
    SUM(SubDesign.AOQ4)    AS SumAOQ4,
    SUM(SubDesign.AOQtot)  AS SumAOQtot    -- if needed
FROM 
    (
        (
            (
                (
                    BrandName
                    INNER JOIN 
                        (
                            SubDesign
                            INNER JOIN DesignName 
                                ON SubDesign.GenCode = DesignName.GenCode
                        )
                    ON BrandName.BrandCode = DesignName.BrandCode
                )
                INNER JOIN Shade 
                    ON SubDesign.ShCode = Shade.ShCode
            )
            INNER JOIN LocName 
                ON SubDesign.LcCode = LocName.LcCode
        )
        INNER JOIN MfgStatus 
            ON SubDesign.MsCode = MfgStatus.MsCode
    )
    INNER JOIN Batch 
        ON SubDesign.BtCode = Batch.BtCode
WHERE
      SubDesign.GenCode  = :gencode
  AND Shade.ShName       = :shname   -- passed from API #1
  AND Batch.BtName      <> 'ZX'
GROUP BY
    Batch.BtName,
    MfgStatus.MsName
ORDER BY
    Batch.BtName,
    MfgStatus.MsName;
        `;

        const results = await sequelize.query(query, {
            replacements: { gencode, shname },
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({ status: 200, success: true, count: results.length, data: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
}


// sename details like name total_order not_ready,half,ready
export const seNameDetails = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();

        const query = `
            SELECT 
    SEName.SEName,
    COUNT(OrdMast.OrdNo) AS TotalOrderCount,
    SUM(OrdMast.CTotQty) AS TotalOrderQty,
    SUM(CASE WHEN OrdMast.OStatus = 'Ready' THEN 1 ELSE 0 END) AS ReadyOrderCount,
    SUM(CASE WHEN OrdMast.OStatus = 'Ready' THEN OrdMast.CTotQty ELSE 0 END) AS ReadyOrderQty,
    SUM(CASE WHEN OrdMast.OStatus = 'HalfReady' THEN 1 ELSE 0 END) AS HalfReadyOrderCount,
    SUM(CASE WHEN OrdMast.OStatus = 'HalfReady' THEN OrdMast.CTotQty ELSE 0 END) AS HalfReadyOrderQty,
    SUM(CASE WHEN OrdMast.OStatus = 'NotReady' THEN 1 ELSE 0 END) AS NotReadyOrderCount,
    SUM(CASE WHEN OrdMast.OStatus = 'NotReady' THEN OrdMast.CTotQty ELSE 0 END) AS NotReadyOrderQty
FROM 
    (OrdMast 
    INNER JOIN CustName ON OrdMast.CCode = CustName.CCode)
    INNER JOIN SEName ON CustName.SECode = SEName.SECode
GROUP BY 
    SEName.SEName;
        `;

        const results = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({ status: 200, success: true, count: results.length, data: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

// get all order 
export const getOrderDetails = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();
        const {search} = req.query;

        let orderQuery = `
            SELECT 
                OrdMast.OrdNo,
                OrdMast.Odate,
                MIN(OrdMast.OCName) AS OCName,
                MIN(OrdMast.OCity) AS OCity,
                MIN(OrdMast.PlaceState) AS PlaceState,
                MIN(OrdMast.Pline) AS Pline,
                MIN(OrdMast.OStatus) AS OStatus,
                MIN(SEName.SEName) AS SEName,
                SUM(OrdSubItem.G1) AS G1,
                SUM(OrdSubItem.G2) AS G2,
                SUM(OrdSubItem.G3) AS G3,
                SUM(OrdSubItem.G4) AS G4
            FROM OrdMast
            INNER JOIN CustName ON OrdMast.CCode = CustName.CCode
            INNER JOIN SEName ON CustName.SECode = SEName.SECode
            INNER JOIN OrdSubItem ON OrdMast.OrdNo = OrdSubItem.OrdNo
            INNER JOIN SubDesign ON OrdSubItem.GenSrNo = SubDesign.GenSrNo
        `;

        if (search) {
            orderQuery += ` WHERE OrdMast.OCName LIKE :search `;
        }

        orderQuery += `
            GROUP BY OrdMast.OrdNo, OrdMast.Odate
            ORDER BY OrdMast.Odate DESC;
        `;


        const orders = await sequelize.query(orderQuery, {
            replacements: {
                search: `%${search}%`
            },
            type: sequelize.QueryTypes.SELECT,
        });

        if (!orders.length) {
            return res.status(200).json({ status: 200, success: true, count: 0, data: [] });
        }

        const orderNos = orders.map(order => order.OrdNo);
        const orderNosStr = orderNos.join(",");

        const orderCountsQuery = `
            SELECT 
                OrdNo, 
                SUM(CTotQty) AS TotalQty, 
                SUM(Cwt) AS TotalWeight, 
                SUM(RdTotQty) AS ReadyQty, 
                SUM(Rdwt) AS ReadyWeight, 
                SUM(NRdTotQty) AS NotReadyQty, 
                SUM(NRdwt) AS NotReadyWeight
            FROM OrdMast
            WHERE OrdNo IN (${orderNosStr})
            GROUP BY OrdNo;
        `;

        const R_NR_Query = `
            SELECT 
                OrdSubItem.OrdNo, 
                OrdSubItem.OrdCN, 
                COUNT(*) AS RecordCount
            FROM OrdSubItem 
            WHERE OrdSubItem.OrdNo IN (${orderNosStr})
            GROUP BY OrdSubItem.OrdNo, OrdSubItem.OrdCN;
        `;

        const orderCounts = await sequelize.query(orderCountsQuery, { type: sequelize.QueryTypes.SELECT });
        const R_NR_Results = await sequelize.query(R_NR_Query, { type: sequelize.QueryTypes.SELECT });

        const orderCountsMap = Object.fromEntries(orderCounts.map(item => [item.OrdNo, item]));
        const readyMap = new Map();
        const notReadyMap = new Map();

        R_NR_Results.forEach(item => {
            if (item.OrdCN === 0) {
                readyMap.set(item.OrdNo, item.RecordCount);
            } else {
                notReadyMap.set(item.OrdNo, item.RecordCount);
            }
        });

        // Grouping records by `Odate`
        const groupedData = {};
        orders.forEach(order => {
            const counts = orderCountsMap[order.OrdNo] || {};
            const orderData = {
                OrdNo: order.OrdNo,
                Odate: order.Odate,
                OCName: order.OCName,
                OCity: order.OCity,
                PlaceState: order.PlaceState,
                Pline: order.Pline,
                OStatus: order.OStatus,
                SEName: order.SEName,
                G1: order.G1 || 0,
                G2: order.G2 || 0,
                G3: order.G3 || 0,
                G4: order.G4 || 0,
                TotalQty: counts.TotalQty || 0,
                TotalWeight: counts.TotalWeight || 0,
                ReadyQty: counts.ReadyQty || 0,
                ReadyWeight: counts.ReadyWeight || 0,
                NotReadyQty: counts.NotReadyQty || 0,
                NotReadyWeight: counts.NotReadyWeight || 0,
                Ready: readyMap.get(order.OrdNo) || 0,
                NotReady: notReadyMap.get(order.OrdNo) || 0,
                Total: (readyMap.get(order.OrdNo) || 0) + (notReadyMap.get(order.OrdNo) || 0),
            };

            if (!groupedData[order.Odate]) {
                groupedData[order.Odate] = {
                    Odate: order.Odate,
                    records: []
                };
            }
            groupedData[order.Odate].records.push(orderData);
        });

        const responseData = Object.values(groupedData);

        res.status(200).json({ status: 200, success: true, count: responseData.length, data: responseData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
};

//get order by order id 
export const getOrderDetailsByID = async (req, res) => {
    try {
        const { ordNo } = req.params;
        const sequelize = getSequelizeInstance();

        const query = `
                    SELECT 
    OrdMast.OrdNo, 
    OrdMast.OCName, 
    OrdMast.OCity, 
    OrdMast.PlaceState, 
    OrdMast.Odate, 
    OrdMast.POno, 
    OrdMast.PODate, 
    SEName.SEName, 
    OrdMast.ORem1, 
    OrdMast.PLdate, 
    RefName.RefName, 
    OrdMast.Deldate, 
    AreaName.AreaName, 
    LevelName.LevelName, 
    OrdMast.LRno, 
    OrdMast.TruckNo, 
    TrptName.TrptName
FROM 
    OrdMast
INNER JOIN 
    CustName ON OrdMast.CCode = CustName.CCode
INNER JOIN 
    SEName ON CustName.SECode = SEName.SECode
INNER JOIN 
    RefName ON CustName.RefCode = RefName.RefCode
INNER JOIN 
    AreaName ON CustName.AreaCode = AreaName.AreaCode
INNER JOIN 
    LevelName ON CustName.LevelCode = LevelName.LevelCode
INNER JOIN 
    TrptName ON OrdMast.TrptCode = TrptName.TrptCode
WHERE 
    OrdMast.OrdNo = :ordNo;
        `;

        const results = await sequelize.query(query, {
            replacements: { ordNo },
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({ status: 200, success: true, count: results.length, data: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

// get order by id total,not_ready,ready
export const getTotalOrderCount_By_OrderID = async (req, res) => {
    try {
        const { ordNo } = req.params;
        const sequelize = getSequelizeInstance();

        // Query to count ready (OrdCN = 0) and not ready (OrdCN = 1) orders
        const countQuery = `
            SELECT 
                OrdSubItem.OrdNo, 
                SubDesign.GenCode, 
                OrdSubItem.Pfcode,
                SUM(CASE WHEN OrdSubItem.OrdCN = 0 THEN 1 ELSE 0 END) AS ReadyCount,
                SUM(CASE WHEN OrdSubItem.OrdCN = 1 THEN 1 ELSE 0 END) AS NotReadyCount
            FROM OrdSubItem
            INNER JOIN SubDesign ON OrdSubItem.GenSrNo = SubDesign.GenSrNo
            WHERE OrdSubItem.OrdNo = :ordNo
            GROUP BY OrdSubItem.OrdNo, SubDesign.GenCode, OrdSubItem.Pfcode;
        `;

        // Query to get order details
        const orderQuery = `
            SELECT 
                OrdMast.OrdNo, 
                SUM(OrdMast.CTotQty) AS TotalQty, 
                SUM(OrdMast.Cwt) AS TotalWeight, 
                SUM(OrdMast.RdTotQty) AS ReadyQty, 
                SUM(OrdMast.Rdwt) AS ReadyWeight, 
                SUM(OrdMast.NRdTotQty) AS NotReadyQty, 
                SUM(OrdMast.NRdwt) AS NotReadyWeight
            FROM OrdMast
            WHERE OrdMast.OrdNo = :ordNo
            GROUP BY OrdMast.OrdNo;
        `;

        // Execute both queries in parallel
        const [countResults, orderResults] = await Promise.all([
            sequelize.query(countQuery, { replacements: { ordNo }, type: sequelize.QueryTypes.SELECT }),
            sequelize.query(orderQuery, { replacements: { ordNo }, type: sequelize.QueryTypes.SELECT }),
        ]);

        // Prepare response
        if (!orderResults.length) {
            return res.status(404).json({ status: 404, success: false, message: "Order not found" });
        }

        const orderData = orderResults[0];
        orderData.Ready = countResults.reduce((sum, row) => sum + row.ReadyCount, 0);
        orderData.NReady = countResults.reduce((sum, row) => sum + row.NotReadyCount, 0);
        orderData.Total = orderData.Ready + orderData.NReady;

        res.status(200).json({ status: 200, success: true, count: 1, data: orderData });
    } catch (error) {
        console.error("Error fetching order data:", error);
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error" });
    }
};

// get order description by order id 

export const getOrderDescriptionByID = async (req, res) => {
    try {
        const { ordNo } = req.params;
        const sequelize = getSequelizeInstance();

        const query = `
            SELECT 
    OrdSubItem.OrdNo, 
    OrdSubItem.OrdCN, 
    SubDesign.GenCode, 
    PrdtName.PrdtName, 
    BrandName.BrandName, 
    SizeName.SizeName, 
    CatName.CatName, 
    DesignName.DesignName, 
    PackFor.PfName, 
    Shade.ShName, 
    Batch.BtName, 
    MfgStatus.MsName, 
    SUM(OrdSubItem.G1) AS SumOfG1, 
    SUM(OrdSubItem.G2) AS SumOfG2, 
    SUM(OrdSubItem.G3) AS SumOfG3, 
    SUM(OrdSubItem.G4) AS SumOfG4,
	SUM(OrdSubItem.Gtot) AS SumOfGtot
FROM 
    OrdSubItem
    INNER JOIN SubDesign ON OrdSubItem.GenSrNo = SubDesign.GenSrNo
    INNER JOIN DesignName ON SubDesign.GenCode = DesignName.GenCode
    INNER JOIN Shade ON SubDesign.ShCode = Shade.ShCode
    INNER JOIN PackFor ON OrdSubItem.PfCode = PackFor.PfCode
    INNER JOIN Batch ON SubDesign.BtCode = Batch.BtCode
    INNER JOIN MfgStatus ON SubDesign.MsCode = MfgStatus.MsCode
    INNER JOIN PrdtName ON DesignName.PrdtCode = PrdtName.PrdtCode
    INNER JOIN BrandName ON DesignName.BrandCode = BrandName.BrandCode
    INNER JOIN SizeName ON DesignName.SizeCode = SizeName.SizeCode
    INNER JOIN CatName ON DesignName.CatCode = CatName.CatCode
WHERE 
    OrdSubItem.OrdNo = :ordNo
GROUP BY 
    OrdSubItem.OrdNo, 
    SubDesign.GenCode, 
    OrdSubItem.OrdCN,
    PrdtName.PrdtName, 
    BrandName.BrandName, 
    SizeName.SizeName, 
    CatName.CatName, 
    DesignName.DesignName, 
    PackFor.PfName, 
    Shade.ShName, 
    Batch.BtName, 
    MfgStatus.MsName;
        `;
        const results = await sequelize.query(query, {
            replacements: { ordNo },
            type: sequelize.QueryTypes.SELECT,
        });
        const groupedData = {};

        results.forEach(item => {
            const key = `${item.SizeName}_${item.CatName}`;
        
        if (!groupedData[key]) {
            groupedData[key] = {
                SizeName: item.SizeName,
                CatName: item.CatName,
                records: [],
                TotalQuntity: 0
            };
        }
        
        groupedData[key].records.push(item);
        groupedData[key].TotalQuntity += item.SumOfGtot;
        });
        

        res.status(200).json({ status: 200, success: true, count:  Object.keys(groupedData).length, data: Object.values(groupedData) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
}
// get total stock count   
export const getTotalStockCount = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();

        const queries = {
            totalStock: `SELECT SUM(SubDesign.Gtot) AS SumOfGtot FROM SubDesign`,
            bookingStock: `SELECT SUM(OrdSubItem.G1) AS SumOfGtot FROM OrdSubItem WHERE OrdSubItem.OrdCN = 0`,
            todayOrder:`select SUM(CTotQty) AS SumOfTtot from OrdMast where Odate=${new Date().toISOString().split('T')[0]}`
        };

        const [totalStockResult, bookingStockResult,todayOrderResult] = await Promise.all([
            sequelize.query(queries.totalStock, { type: sequelize.QueryTypes.SELECT }),
            sequelize.query(queries.bookingStock, { type: sequelize.QueryTypes.SELECT }),
            sequelize.query(queries.todayOrder, { type: sequelize.QueryTypes.SELECT })
        ]);

        const totalStock = totalStockResult[0]?.SumOfGtot || 0;
        const bookingStock = bookingStockResult[0]?.SumOfGtot || 0;
        const todayOrders = todayOrderResult[0]?.SumOfTtot || 0;
        const afterOrderStock = totalStock - bookingStock;

        res.status(200).json({
            status: 200,
            success: true,
            data: [{ total_stock: totalStock, booking_stock: bookingStock, after_order_stock: afterOrderStock,todayOrder:todayOrders }]
        });
    } catch (error) {
        console.error('Error fetching stock count:', error);
        res.status(500).json({ status: 500, success: false, message: 'Internal Server Error' });
    }
};


// get all order count 
export const getAllOrderTotalCount = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();

        const query = `
            SELECT 
                COUNT(O.OrdNo) AS TotalOrderCount,
                SUM(O.CTotQty) AS TotalOrderQty,
                SUM(CASE WHEN O.OStatus = 'Ready' THEN 1 ELSE 0 END) AS ReadyOrderCount,
                SUM(CASE WHEN O.OStatus = 'Ready' THEN O.CTotQty ELSE 0 END) AS ReadyOrderQty,
                SUM(CASE WHEN O.OStatus = 'HalfReady' THEN 1 ELSE 0 END) AS HalfReadyOrderCount,
                SUM(CASE WHEN O.OStatus = 'HalfReady' THEN O.CTotQty ELSE 0 END) AS HalfReadyOrderQty,
                SUM(CASE WHEN O.OStatus = 'NotReady' THEN 1 ELSE 0 END) AS NotReadyOrderCount,
                SUM(CASE WHEN O.OStatus = 'NotReady' THEN O.CTotQty ELSE 0 END) AS NotReadyOrderQty
            FROM OrdMast O
            INNER JOIN CustName C ON O.CCode = C.CCode
            INNER JOIN SEName S ON C.SECode = S.SECode
        `;

        const [results] = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

        res.status(200).json({ 
            status: 200, 
            success: true, 
            data: results  
        });
    } catch (error) {
        console.error("Error fetching order count:", error);
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error" });
    }
};

// get order details by Gencode, Btcode, shcode, mscode
export const getOrderDetailsByGencode_Btcode_Shcode_MsCode = async(req, res) => {
    try{
        const {gencode , btcode, shcode, mscode} = req.params;
        const sequelize = getSequelizeInstance();
        
        const query = `
        SELECT 
            OrdMast.OrdNo,
            MIN(OrdMast.Odate) AS Odate,
            MIN(OrdMast.OCName) AS OCName,
            MIN(OrdMast.OCity) AS OCity,
            MIN(OrdMast.PlaceState) AS PlaceState,
            MIN(OrdMast.Pline) AS Pline,
            MIN(OrdMast.OStatus) AS OStatus,
            MIN(SEName.SEName) AS SEName,
            SUM(OrdSubItem.G1) AS G1,
            SUM(OrdSubItem.G2) AS G2,
            SUM(OrdSubItem.G3) AS G3,
            SUM(OrdSubItem.G4) AS G4
        FROM 
            OrdMast
            INNER JOIN CustName ON OrdMast.CCode = CustName.CCode
            INNER JOIN SEName ON CustName.SECode = SEName.SECode
            INNER JOIN OrdSubItem ON OrdMast.OrdNo = OrdSubItem.OrdNo
            INNER JOIN SubDesign ON OrdSubItem.GenSrNo = SubDesign.GenSrNo
        WHERE 
            SubDesign.GenCode = :gencode
            AND SubDesign.BtCode = :btcode
            AND SubDesign.ShCode = :shcode
            AND SubDesign.MsCode = :mscode

        GROUP BY 
            OrdMast.OrdNo;`;

        const results = await sequelize.query(query, {
            replacements: { gencode, btcode, shcode, mscode },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({ 
            status: 200, 
            success: true,
            count: results.length,
            data: results  
        });
    } catch(error) {
        console.error("Error fetching order details :", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})
    }
}

export const getOrderDetailsByGencode_pfname = async(req, res) => {
    try{
        const {gencode, pfname} = req.params;
        const sequelize = getSequelizeInstance()

        const query = `
        SELECT 
            OrdMast.OrdNo,
            MIN(OrdMast.Odate) AS FirstOfOdate,
            MIN(OrdMast.OCName) AS FirstOfOCName,
            MIN(OrdMast.OCity) AS FirstOfOCity,
            MIN(OrdMast.PlaceState) AS FirstOfPlaceState,
            MIN(OrdMast.Pline) AS FirstOfPline,
            MIN(OrdMast.OStatus) AS FirstOfOStatus,
            MIN(SEName.SEName) AS FirstOfSEName,
            Batch.BtName,
            Shade.ShName,
            MfgStatus.MsName,
            PackFor.PfName,
            SUM(OrdSubItem.G1) AS SumOfG1,
            SUM(OrdSubItem.G2) AS SumOfG2,
            SUM(OrdSubItem.G3) AS SumOfG3,
            SUM(OrdSubItem.G4) AS SumOfG4,
            SUM(OrdSubItem.Gtot) AS SumOfGtot,
            OrdSubItem.OrdCN
        FROM 
            SEName 
            INNER JOIN CustName ON SEName.SECode = CustName.SECode
            INNER JOIN OrdMast ON CustName.CCode = OrdMast.CCode
            INNER JOIN OrdSubItem ON OrdMast.OrdNo = OrdSubItem.OrdNo
            INNER JOIN SubDesign ON OrdSubItem.GenSrNo = SubDesign.GenSrNo
            INNER JOIN DesignName ON SubDesign.GenCode = DesignName.GenCode
            INNER JOIN Batch ON SubDesign.BtCode = Batch.BtCode
            INNER JOIN Shade ON SubDesign.ShCode = Shade.ShCode
            INNER JOIN MfgStatus ON SubDesign.MsCode = MfgStatus.MsCode
            INNER JOIN PackFor ON OrdSubItem.PfCode = PackFor.PfCode
        WHERE 
            SubDesign.GENCODE = :gencode 
            AND packfor.pfname = :pfname
        GROUP BY 
            OrdMast.OrdNo,
            Batch.BtName,
            Shade.ShName,
            MfgStatus.MsName,
            PackFor.PfName,
            OrdSubItem.OrdCN;
        `;

        const results = await sequelize.query(query, {
            replacements: { gencode, pfname},
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({ 
            status: 200, 
            success: true, 
            count: results.length,
            data: results  
        });

    } catch(error) {
        console.log("Error fetching order details: ", error);
        res.status(500).json({status: 500, success: false, message: "Internal Server Error"})
    }
}



// old one
// export const getDataListV2 = async (req, res) => {
//     try {
//         const { search } = req.query;
//         const sequelize = getSequelizeInstance();

//         const searchCondition = search ? `WHERE DesignName.DesignName LIKE :search` : '';

//         //     const query = `
//         //     SELECT 
//         //         DesignName.DesignName, 
//         //         Shade.ShName, 
//         //         SizeName.SizeName, 
//         //         CatName.CatName, 
//         //         SUM(SubDesign.G1) AS SumOfG1
//         //     FROM 
//         //         (((DesignName 
//         //         INNER JOIN SubDesign ON DesignName.GenCode = SubDesign.GenCode) 
//         //         INNER JOIN SizeName ON DesignName.SizeCode = SizeName.SizeCode) 
//         //         INNER JOIN CatName ON DesignName.CatCode = CatName.CatCode) 
//         //         INNER JOIN Shade ON SubDesign.ShCode = Shade.ShCode
//         //     ${searchCondition}
//         //     GROUP BY 
//         //         DesignName.DesignName, 
//         //         Shade.ShName, 
//         //         SizeName.SizeName, 
//         //         CatName.CatName, 
//         //         DesignName.GenCode
//         //     HAVING 
//         //         SUM(SubDesign.G1) != 0;
//         // `;

//         const query = `
//     SELECT 
//         DesignName.DesignName, 
//         SubDesign.GenCode,
//         SubDesign.ShCode,
//         Shade.ShName, 
//         SizeName.SizeName, 
//         CatName.CatName, 
//         SUM(SubDesign.G1) AS SumOfG1
//     FROM 
//         (((DesignName 
//         INNER JOIN SubDesign ON DesignName.GenCode = SubDesign.GenCode) 
//         INNER JOIN SizeName ON DesignName.SizeCode = SizeName.SizeCode) 
//         INNER JOIN CatName ON DesignName.CatCode = CatName.CatCode) 
//         INNER JOIN Shade ON SubDesign.ShCode = Shade.ShCode
//     ${searchCondition}
//     GROUP BY 
//         DesignName.DesignName, 
//         SubDesign.GenCode, -- Added GenCode to GROUP BY
//         SubDesign.ShCode,  -- Added ShCode to GROUP BY
//         Shade.ShName, 
//         SizeName.SizeName, 
//         CatName.CatName
//     HAVING 
//         SUM(SubDesign.G1) != 0;
// `;

//         const results = await sequelize.query(query, {
//             replacements: { search: `%${search}%` },
//             type: sequelize.QueryTypes.SELECT,
//         });

//         res.status(200).json({ status: 200, success: true, count: results.length, data: results });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ status: 500, success: false, message: error.message });
//     }
// }

// export const stockListData = async (req, res) => {
//     try {
//         const sequelize = getSequelizeInstance();

//         const query = `
//     -- Declare variables
// DECLARE @v_GenCode NVARCHAR(50),
//         @v_ShCode NVARCHAR(50),
//         @v_DesignName NVARCHAR(100),
//         @v_CatName NVARCHAR(100),
//         @v_ShName NVARCHAR(100),
//         @v_SizeName NVARCHAR(100),
//         @v_BrandName NVARCHAR(100),
//         @v_SeriesName NVARCHAR(100),
//         @v_FGName NVARCHAR(100),
//         @v_DTName NVARCHAR(100),
//         @v_DSName NVARCHAR(100),
//         @v_PcsBox INT,
//         @v_BtBoxWt DECIMAL(18, 2),
//         @v_SqFeet NVARCHAR(100),
//         @v_SqMtr NVARCHAR(100),
//         @v_DesignAct NVARCHAR(100),
//         @v_BPName NVARCHAR(100),
//         @v_G1 DECIMAL(10, 2),
//         @v_G2 DECIMAL(10, 2),
//         @v_G3 DECIMAL(10, 2),
//         @v_G4 DECIMAL(10, 2),
//         @v_G5 DECIMAL(10, 2),
//         @v_Gtot DECIMAL(10, 2),
//         @v_OQ1 DECIMAL(10, 2),
//         @v_OQ2 DECIMAL(10, 2),
//         @v_OQ3 DECIMAL(10, 2),
//         @v_OQ4 DECIMAL(10, 2),
//         @v_OQ5 DECIMAL(10, 2),
//         @v_OQtot DECIMAL(10, 2),
//         @v_AOQ1 DECIMAL(10, 2),
//         @v_AOQ2 DECIMAL(10, 2),
//         @v_AOQ3 DECIMAL(10, 2),
//         @v_AOQ4 DECIMAL(10, 2),
//         @v_AOQ5 DECIMAL(10, 2),
//         @v_AOQtot DECIMAL(10, 2),
//         @v_PfCode NVARCHAR(50),
//         @v_OrderQty DECIMAL(10, 2),
//         @v_CurrStockQty DECIMAL(10, 2),
//         @v_AfterOrderQty DECIMAL(10, 2);

// -- Create temporary table
// CREATE TABLE #TempTable (
//     GenCode NVARCHAR(50),
//     ShCode NVARCHAR(50),
//     DesignName NVARCHAR(100),
//     CatName NVARCHAR(100),
//     ShName NVARCHAR(100),
//     SizeName NVARCHAR(100),
//     BrandName NVARCHAR(100),
//     SeriesName NVARCHAR(100),
//     FGName NVARCHAR(100),
//     DTName NVARCHAR(100),
//     DSName NVARCHAR(100),
//     PcsBox INT,
//     BtBoxWt DECIMAL(18, 2),
//     SqFeet NVARCHAR(100),
//     SqMtr NVARCHAR(100),
//     DesignAct NVARCHAR(100),
//     BPName NVARCHAR(100),
//     G1 DECIMAL(18, 2),
//     G2 DECIMAL(18, 2),
//     G3 DECIMAL(18, 2),
//     G4 DECIMAL(18, 2),
//     G5 DECIMAL(18, 2),
//     Gtot DECIMAL(18, 2),
//     OQ1 DECIMAL(18, 2),
//     OQ2 DECIMAL(18, 2),
//     OQ3 DECIMAL(18, 2),
//     OQ4 DECIMAL(18, 2),
//     OQ5 DECIMAL(18, 2),
//     OQtot DECIMAL(18, 2),
//     AOQ1 DECIMAL(18, 2),
//     AOQ2 DECIMAL(18, 2),
//     AOQ3 DECIMAL(18, 2),
//     AOQ4 DECIMAL(18, 2),
//     AOQ5 DECIMAL(18, 2),
//     AOQtot DECIMAL(18, 2),
//     OrderQty DECIMAL(10, 2),
//     AfterOrderQty DECIMAL(10, 2)
// );

// -- Define cursor
// DECLARE cur CURSOR FOR
// SELECT
//     SubDesign.GenCode,
//     SubDesign.ShCode,
//     DesignName.DesignName,
//     CatName.CatName,
//     Shade.ShName,
//     SizeName.SizeName,
//     MIN(BrandName.BrandName) AS FirstOfBrandName,
//     MIN(SeriesName.SeriesName) AS FirstOfSeriesName,
//     MIN(FinishGlaze.FGName) AS FirstOfFGName,
//     MIN(DesignType.DTName) AS FirstOfDTName,
//     MIN(DesignStatus.DSName) AS FirstOfDSName,
//     MIN(SizeName.PcsBox) AS FirstOfPcsBox,
//     MIN(SubDesign.BtBoxWt) AS FirstOfBtBoxWt,
//     MIN(SizeName.SqFeet) AS FirstOfSqFeet,
//     MIN(SizeName.SqMtr) AS FirstOfSqMtr,
//     MIN(DesignName.DesignAct) AS FirstOfDesignAct,
//     MIN(BPName.BPName) AS FirstOfBPName,
//     SUM(SubDesign.G1) AS G1,
//     SUM(SubDesign.G2) AS G2,
//     SUM(SubDesign.G3) AS G3,
//     SUM(SubDesign.G4) AS G4,
//     SUM(SubDesign.G5) AS G5,
//     SUM(SubDesign.Gtot) AS Gtot,
//     SUM(SubDesign.OQ1) AS OQ1,
//     SUM(SubDesign.OQ2) AS OQ2,
//     SUM(SubDesign.OQ3) AS OQ3,
//     SUM(SubDesign.OQ4) AS OQ4,
//     SUM(SubDesign.OQ5) AS OQ5,
//     SUM(SubDesign.OQtot) AS OQtot,
//     SUM(SubDesign.AOQ1) AS AOQ1,
//     SUM(SubDesign.AOQ2) AS AOQ2,
//     SUM(SubDesign.AOQ3) AS AOQ3,
//     SUM(SubDesign.AOQ4) AS AOQ4,
//     SUM(SubDesign.AOQ5) AS AOQ5,
//     SUM(SubDesign.AOQtot) AS AOQtot
// FROM
//     SubDesign
//     INNER JOIN DesignName ON SubDesign.GenCode = DesignName.GenCode
//     INNER JOIN SizeName ON DesignName.SizeCode = SizeName.SizeCode
//     INNER JOIN Shade ON SubDesign.ShCode = Shade.ShCode
//     INNER JOIN BrandName ON DesignName.BrandCode = BrandName.BrandCode
//     INNER JOIN SeriesName ON DesignName.SeriesCode = SeriesName.SeriesCode
//     INNER JOIN FinishGlaze ON DesignName.FGCode = FinishGlaze.FGCode
//     INNER JOIN DesignType ON DesignName.DTCode = DesignType.DTCode
//     INNER JOIN DesignStatus ON DesignName.DSCode = DesignStatus.DSCode
//     INNER JOIN BPName ON DesignName.BPCode = BPName.BPCode
//     INNER JOIN CatName ON DesignName.CatCode = CatName.CatCode
// WHERE
//     SubDesign.Gtot <> 0
// GROUP BY
//     SubDesign.GenCode, SubDesign.ShCode, DesignName.DesignName, CatName.CatName, Shade.ShName, SizeName.SizeName;

// -- Open cursor
// OPEN cur;
// FETCH NEXT FROM cur INTO
//     @v_GenCode, @v_ShCode, @v_DesignName, @v_CatName, @v_ShName, @v_SizeName,
//     @v_BrandName, @v_SeriesName, @v_FGName, @v_DTName, @v_DSName, @v_PcsBox,
//     @v_BtBoxWt, @v_SqFeet, @v_SqMtr, @v_DesignAct, @v_BPName,
//     @v_G1, @v_G2, @v_G3, @v_G4, @v_G5, @v_Gtot,
//     @v_OQ1, @v_OQ2, @v_OQ3, @v_OQ4, @v_OQ5, @v_OQtot,
//     @v_AOQ1, @v_AOQ2, @v_AOQ3, @v_AOQ4, @v_AOQ5, @v_AOQtot;

// -- Process each row
// WHILE @@FETCH_STATUS = 0
// BEGIN
//     -- Get PfCode
//     SELECT @v_PfCode = PfCode
//     FROM PackFor
//     WHERE PfName = @v_ShName;

//     -- Calculate OrderQty
//     SELECT @v_OrderQty = ISNULL(SUM(OrgQty), 0)
//     FROM OrdItem
//     WHERE GenCode = @v_GenCode AND PfCode = @v_PfCode;

//     SET @v_CurrStockQty = 1000; -- Example fixed stock quantity
//     SET @v_AfterOrderQty = @v_CurrStockQty - @v_OrderQty;

//     -- Insert into temp table
//     INSERT INTO #TempTable
//     (GenCode, ShCode, DesignName, CatName, ShName, SizeName, BrandName, SeriesName, FGName, DTName, DSName, PcsBox, BtBoxWt, SqFeet, SqMtr, DesignAct, BPName, G1, G2, G3, G4, G5, Gtot, OQ1, OQ2, OQ3, OQ4, OQ5, OQtot, AOQ1, AOQ2, AOQ3, AOQ4, AOQ5, AOQtot, OrderQty, AfterOrderQty)
//     VALUES
//     (@v_GenCode, @v_ShCode, @v_DesignName, @v_CatName, @v_ShName, @v_SizeName,
//      @v_BrandName, @v_SeriesName, @v_FGName, @v_DTName, @v_DSName, @v_PcsBox,
//      @v_BtBoxWt, @v_SqFeet, @v_SqMtr, @v_DesignAct, @v_BPName,
//      @v_G1, @v_G2, @v_G3, @v_G4, @v_G5, @v_Gtot,
//      @v_OQ1, @v_OQ2, @v_OQ3, @v_OQ4, @v_OQ5, @v_OQtot,
//      @v_AOQ1, @v_AOQ2, @v_AOQ3, @v_AOQ4, @v_AOQ5, @v_AOQtot, @v_OrderQty, @v_AfterOrderQty);

//     FETCH NEXT FROM cur INTO
//         @v_GenCode, @v_ShCode, @v_DesignName, @v_CatName, @v_ShName, @v_SizeName,
//         @v_BrandName, @v_SeriesName, @v_FGName, @v_DTName, @v_DSName, @v_PcsBox,
//         @v_BtBoxWt, @v_SqFeet, @v_SqMtr, @v_DesignAct, @v_BPName,
//         @v_G1, @v_G2, @v_G3, @v_G4, @v_G5, @v_Gtot,
//         @v_OQ1, @v_OQ2, @v_OQ3, @v_OQ4, @v_OQ5, @v_OQtot,
//         @v_AOQ1, @v_AOQ2, @v_AOQ3, @v_AOQ4, @v_AOQ5, @v_AOQtot;
// END;

// -- Close and deallocate cursor
// CLOSE cur;
// DEALLOCATE cur;

// -- Return results
// SELECT * FROM #TempTable;

// -- Drop temp table
// DROP TABLE #TempTable;
// `;

//         const results = await sequelize.query(query, {
//             type: sequelize.QueryTypes.SELECT,
//         });

//         res.status(200).json({ status: 200, success: true, count: results.length, data: results });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ status: 500, success: false, message: error.message });
//     }
// }

// export const productDescriptionData = async (req, res) => {
//     try {
//         const sequelize = getSequelizeInstance();

//         //         const query = `
//         //         SELECT 
//         //     SubDesign.GenCode,
//         //     SubDesign.ShCode,
//         //     MIN(BrandName.BrandName) AS FirstOfBrandName,
//         //     MIN(SizeName.SizeName) AS FirstOfSizeName,
//         //     MIN(CatName.CatName) AS FirstOfCatName,
//         //     MIN(SeriesName.SeriesName) AS FirstOfSeriesName,
//         //     MIN(FinishGlaze.FGName) AS FirstOfFGName,
//         //     MIN(DesignType.DTName) AS FirstOfDTName,
//         //     MIN(DesignStatus.DSName) AS FirstOfDSName,
//         //     MIN(SizeName.PcsBox) AS FirstOfPcsBox,
//         //     MIN(SubDesign.BtBoxWt) AS FirstOfBtBoxWt,
//         //     MIN(SizeName.SqFeet) AS FirstOfSqFeet,
//         //     MIN(SizeName.SqMtr) AS FirstOfSqMtr,
//         //     MIN(DesignName.DesignAct) AS FirstOfDesignAct,
//         //     MIN(BPName.BPName) AS FirstOfBPName
//         // FROM 
//         //     (((((((((SubDesign 
//         //     INNER JOIN DesignName ON SubDesign.GenCode = DesignName.GenCode) 
//         //     INNER JOIN SizeName ON DesignName.SizeCode = SizeName.SizeCode) 
//         //     INNER JOIN Shade ON SubDesign.ShCode = Shade.ShCode) 
//         //     INNER JOIN BrandName ON DesignName.BrandCode = BrandName.BrandCode) 
//         //     INNER JOIN SeriesName ON DesignName.SeriesCode = SeriesName.SeriesCode) 
//         //     INNER JOIN FinishGlaze ON DesignName.FGCode = FinishGlaze.FGCode) 
//         //     INNER JOIN DesignType ON DesignName.DTCode = DesignType.DTCode) 
//         //     INNER JOIN DesignStatus ON DesignName.DSCode = DesignStatus.DSCode) 
//         //     INNER JOIN BPName ON DesignName.BPCode = BPName.BPCode) 
//         //     INNER JOIN CatName ON DesignName.CatCode = CatName.CatCode
//         // GROUP BY 
//         //     SubDesign.GenCode, 
//         //     SubDesign.ShCode;
//         //     `;

//         //         const results = await sequelize.query(query, {
//         //             type: sequelize.QueryTypes.SELECT,
//         //         });

//         const genCode = req.params.gencode;
//         const shCode = req.params.shcode;

//         const query = `
    // SELECT 
    //     SubDesign.GenCode,
    //     SubDesign.ShCode,
    //     MIN(BrandName.BrandName) AS FirstOfBrandName,
    //     MIN(SizeName.SizeName) AS FirstOfSizeName,
    //     MIN(CatName.CatName) AS FirstOfCatName,
    //     MIN(SeriesName.SeriesName) AS FirstOfSeriesName,
    //     MIN(FinishGlaze.FGName) AS FirstOfFGName,
    //     MIN(DesignType.DTName) AS FirstOfDTName,
    //     MIN(DesignStatus.DSName) AS FirstOfDSName,
    //     MIN(SizeName.PcsBox) AS FirstOfPcsBox,
    //     MIN(SubDesign.BtBoxWt) AS FirstOfBtBoxWt,
    //     MIN(SizeName.SqFeet) AS FirstOfSqFeet,
    //     MIN(SizeName.SqMtr) AS FirstOfSqMtr,
    //     MIN(DesignName.DesignAct) AS FirstOfDesignAct,
    //     MIN(BPName.BPName) AS FirstOfBPName
    // FROM 
    //     (((((((((SubDesign 
    //     INNER JOIN DesignName ON SubDesign.GenCode = DesignName.GenCode) 
    //     INNER JOIN SizeName ON DesignName.SizeCode = SizeName.SizeCode) 
    //     INNER JOIN Shade ON SubDesign.ShCode = Shade.ShCode) 
    //     INNER JOIN BrandName ON DesignName.BrandCode = BrandName.BrandCode) 
    //     INNER JOIN SeriesName ON DesignName.SeriesCode = SeriesName.SeriesCode) 
    //     INNER JOIN FinishGlaze ON DesignName.FGCode = FinishGlaze.FGCode) 
    //     INNER JOIN DesignType ON DesignName.DTCode = DesignType.DTCode) 
    //     INNER JOIN DesignStatus ON DesignName.DSCode = DesignStatus.DSCode) 
    //     INNER JOIN BPName ON DesignName.BPCode = BPName.BPCode) 
    //     INNER JOIN CatName ON DesignName.CatCode = CatName.CatCode
    // WHERE 
    //     SubDesign.GenCode = :genCode AND
    //     SubDesign.ShCode = :shCode
    // GROUP BY 
    //     SubDesign.GenCode, 
    //     SubDesign.ShCode;
// `;

//         const results = await sequelize.query(query, {
//             type: sequelize.QueryTypes.SELECT,
//             replacements: { genCode, shCode }, // Pass GenCode and ShCode values as parameters
//         });

//         res.status(200).json({ status: 200, success: true, count: results.length, data: results });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ status: 500, success: false, message: error.message });
//     }
// }
