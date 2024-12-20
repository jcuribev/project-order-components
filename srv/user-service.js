const cds = require('@sap/cds')
const { message } = require('@sap/cds/lib/log/cds-error')

class UserService extends cds.ApplicationService {
    async init() {
        this.on('fetchCustomerInformation', 'Customers', this.fetchCustomerInformation)

        this.on('fetchBusinessPartner', this.fetchBusinessPartner)

        this.on('createCustomer', 'Customers', this.createCustomer)

        this.on('updateUserDetails', 'Customers', this.updateUserDetails)

        this.on('createSupporter', 'Supporters', this.createSupporter)

        await super.init()
    }

    async fetchBusinessPartner(businessPartnerID) {
        if (!businessPartnerID)
            return { code: 400, message: 'BusinessPartnerID must not be empty' }

        const businessPartner = await this.findBusinessPartnerID(businessPartnerID)

        if (!businessPartner)
            return { code: 404, message: `businessPartner with ID ${businessPartnerID} does not exist` }

        return businessPartner
    }

    async createCustomer(customerName, address, externalCustomerID) {
        try {
            if (!customerName || !address || !externalCustomerID)
                return { code: 400, message: 'The customer name, address and the external customer ID must not be empty' }

            const externalCustomer = await this.findBusinessPartnerID(externalCustomerID)
            if (!externalCustomer)
                return { code: 400, message: 'Customer could not be created. Business partner ID does not exist.' }

            const userByExternalID = await this.findCustomerByCriteria({ businessCostumer: externalCustomerID })
            if (userByExternalID)
                return { code: 400, message: 'A customer is already associated with that business partner ID.' }

            const userByName = await this.findCustomerByCriteria({ name: customerName })
            if (userByName)
                return { code: 400, message: `A customer has already been created with the name ${customerName}` }

            const newCustomerData = {
                name: customerName,
                address: address,
                businessCostumer: externalCustomerID
            }

            const createCustomerResult = await this.insertCustomerToDatabase(newCustomerData)

            if (!createCustomerResult)
                return { code: 500, message: 'Customer could not be created. Server error.' }


            const createdUser = await this.findCustomerByCriteria({ name: customerName })

            return createdUser
        }
        catch (error) {
            throw new Error(error)
        }
    }

    async createSupporter(supporterName) {
        try {

            if (!supporterName && supporterName === '')
                return { code: 400, message: 'The supporter name must not be empty' }

            const supporterByName = await this.findSupporterByCriteria({ name: supporterName })

            if (supporterByName)
                return { code: 400, message: `A supporter has already been created with the name ${supporterName}` }

            const newSupporterData = {
                name: supporterName
            }

            const createSupporterResult = await this.insertSupporterToDatabase(newSupporterData)

            if (!createSupporterResult)
                return { code: 500, message: 'supporter could not be created. Server error.' }


            const createdSupporter = await this.findSupporterByCriteria({ name: supporterName })

            return createdSupporter
        }
        catch (error) {
            throw new Error(error)
        }
    }

    async fetchCustomerInformation(customerID) {
        return await this.findCustomerByCriteria({ ID: customerID })
    }

    async updateUserDetails(userID, changes) {
        try {

            const userExists = await this.findCustomerByCriteria({ ID: userID })

            if (!userExists)
                return { code: 404, message: `User with ID ${userID} does not exist` }

            if (!changes || Object.keys(changes).length === 0)
                return { code: 400, message: 'No fields provided for update' }

            if ('businessCustomer' in changes)
                return { code: 400, message: 'Modification of "businessCustomer" field is not allowed' }

            return true;

        } catch (error) {
            throw new Error(error)
        }
    }

    async insertCustomerToDatabase(customerData) {
        const { Customers } = this.entities
        return await INSERT.into(Customers).entries(customerData);
    }

    async insertSupporterToDatabase(supporterData) {
        const { Supporters } = this.entities
        return await INSERT.into(Supporters).entries(supporterData);
    }

    async findCustomerByCriteria(queryCriteria) {
        const { Customers } = this.entities
        return await SELECT.one.from(Customers).where(queryCriteria)
    }

    async updateCustomer(userID, body) {
        const { Customers } = this.entities;
        await UPDATE(Customers).set(body).where({ ID: userID });
    }

    async findBusinessPartnerID(businessPartnerID) {
        const businessPartnerService = await cds.connect.to('API_BUSINESS_PARTNER');
        const { A_Customer } = businessPartnerService.entities;
        const result = await (businessPartnerService.run(SELECT.from(A_Customer).where({ Customer: businessPartnerID })))

        return result[0]
    }

    async findSupporterByCriteria(queryCriteria) {
        const { Supporters } = this.entities
        return await SELECT.one.from(Supporters).where(queryCriteria)
    }

    
}

module.exports = UserService
