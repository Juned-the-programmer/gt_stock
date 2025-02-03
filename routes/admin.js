import express from "express";
import { getAllOrderTotalCount, getDataList, getDetails, getOrderDescriptionByID, getOrderDetails, getOrderDetailsByID, getTotalOrderCount_By_OrderID, getTotalStockCount, seNameDetails, stockDetails, stockDetailsWithBatchAndManufacturing, getOrderDetailsByGencode_Btcode_Shcode_MsCode, getOrderDetailsByGencode_pfname } from "../controllers/admin.js";
import authenticateJWT from "../controllers/authorization.js";
const router = express.Router();

router.get('/data/list/v1', getDataList);
router.get('/details/v1', getDetails); // use less
router.get('/stock/details/:gencode/v1', stockDetails);
router.get('/stock/details/batch/manufacturing/:gencode/:shname/v1', stockDetailsWithBatchAndManufacturing);


router.get('/order/details/v1', getOrderDetails);
router.get('/order/details/totalcount/v1', getAllOrderTotalCount);
router.get('/order/details/totalstock/v1', getTotalStockCount);
router.get('/order/details/:ordNo/v1', getOrderDetailsByID);
router.get('/order/details/totalorder/:ordNo/v1', getTotalOrderCount_By_OrderID);
router.get('/order/details/description/:ordNo/v1', getOrderDescriptionByID);
router.get('/data/details/sename/v1', seNameDetails);
router.get('/order/details/:gencode/:btcode/:shcode/:mscode/v1', getOrderDetailsByGencode_Btcode_Shcode_MsCode);
router.get('/order/details/:gencode/:pfname/v1', getOrderDetailsByGencode_pfname);
// router.get('/data/list/v2', getDataListV2); // old one
// router.get('/stock/list/data/v1', stockListData);
// router.get('/product/list/description/:gencode/:shcode/v1', productDescriptionData);

export default router;