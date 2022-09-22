import { jest } from "@jest/globals";
import  voucherService from '../../src/services/voucherService'
import voucherRepository from '../../src/repositories/voucherRepository'
import * as errors from '../../src/utils/errorUtils'

describe("Testing create voucher",()=>{
    it("Should throw error if code is not unique",async()=>{
        const voucherData={
            id:1,
            code:"02",
            discount:20,
            used:false
        }

        jest
            .spyOn(voucherRepository, "getVoucherByCode")
            .mockResolvedValueOnce(voucherData);
            
        const query = voucherService.createVoucher(
            voucherData.code,
            voucherData.discount,
        );
        expect(query).rejects.toEqual(errors.conflictError("Voucher already exist."))
    });
})
describe("Testing apply voucher", ()=>{
    it("Should throw error if code does not exist",async()=>{
        jest
            .spyOn(voucherRepository, "getVoucherByCode")
            .mockResolvedValueOnce(null);
        
        const query = voucherService.applyVoucher(
            "aaa",22
        )

        expect(query).rejects.toEqual(errors.conflictError("Voucher does not exist."))
    })
    it("Should return applied false if voucher was already used",async()=>{
        const voucherData={
            id:1,
            code:"02",
            discount:20,
            used:true
        }

        jest
            .spyOn(voucherRepository, "getVoucherByCode")
            .mockResolvedValueOnce(voucherData);
        jest
            .spyOn(voucherRepository,"useVoucher")
            .mockReturnValueOnce(undefined);
        
        const query= await voucherService.applyVoucher(voucherData.code, 300)

        expect(query.applied).toEqual(false);
    })
    it("Should return applied false if amount is not valid for discount",async()=>{
        const voucherData={
            id:1,
            code:"02",
            discount:20,
            used:false
        }

        jest
            .spyOn(voucherRepository, "getVoucherByCode")
            .mockResolvedValueOnce(voucherData);
        jest
            .spyOn(voucherRepository,"useVoucher")
            .mockReturnValueOnce(undefined);
        
        const query= await voucherService.applyVoucher(voucherData.code, 50)

        expect(query.applied).toEqual(false);
    })
    it("Test if discount is properly calculated",async ()=>{
        const voucherData={
            id:1,
            code:"02",
            discount:20,
            used:false
        }
        const amount=100;
        const expectedData={
            amount:amount,
            discount: voucherData.discount,
            finalAmount:amount-amount*(voucherData.discount/100),
            applied: true
        }

        jest
            .spyOn(voucherRepository, "getVoucherByCode")
            .mockResolvedValueOnce(voucherData);
        jest
            .spyOn(voucherRepository,"useVoucher")
            .mockReturnValueOnce(undefined);
        
        const query= await voucherService.applyVoucher(voucherData.code, amount)
        
        expect(query).toMatchObject(expectedData);
    })
})