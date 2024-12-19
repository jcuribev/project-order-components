const cds = require('@sap/cds')

class UserService extends cds.ApplicationService {
    async init() {
        this.on('fetchCustomerInformation', 'Customers', this.fetchCustomerInformation)

        this.on('fetchBusinessPartner', this.fetchBusinessPartner)

        this.on('createCustomer', 'Customers', this.createCustomer)

        this.on('updateUserDetails', 'Customers', this.updateUserDetails)

        this.on('createSupporter', 'Supporters', this.createSupporter)

        await super.init()
    }

    async createCustomer(customerName, address, externalCustomerID) {
        try {
            if (!customerName || !address || !externalCustomerID)
                throw new Error('The customer name, address and the external customer ID must not be empty')

            const externalCustomer = await this.findBusinessPartnerID(externalCustomerID)
            if (!externalCustomer)
                throw new Error('Customer could not be created. Business partner ID does not exist.')

            const userByExternalID = await this.findCustomerByCriteria({ businessCostumer: externalCustomerID })
            if (userByExternalID)
                throw new Error('A customer is already associated with that business partner ID.')

            const userByName = await this.findCustomerByCriteria({ name: customerName })
            if (userByName)
                throw new Error(`A customer has already been created with the name ${customerName}`)

            const newCustomerData = {
                name: customerName,
                address: address,
                businessCostumer: externalCustomerID
            }

            const createCustomerResult = await this.insertCustomerToDatabase(newCustomerData)

            if (!createCustomerResult)
                throw new Error('Customer could not be created. Server error.')


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
                throw new Error('The supporter name must not be empty')

            const supporterByName = await this.findSupporterByCriteria({ name: supporterName })

            if (supporterByName)
                throw new Error(`A supporter has already been created with the name ${supporterName}`)

            const newSupporterData = {
                name: supporterName
            }

            const createSupporterResult = await this.insertSupporterToDatabase(newSupporterData)

            if (!createSupporterResult)
                throw new Error('supporter could not be created. Server error.')


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
                throw new Error(`User with ID ${userID} does not exist`)

            if (!changes || Object.keys(changes).length === 0)
                throw new Error('No fields provided for update')

            if ('businessCustomer' in changes)
                throw new Error('Modification of "businessCustomer" field is not allowed')

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

    async fetchBusinessPartner(businessPartnerID){
        if(!businessPartnerID)
            throw new Error('BusinessPartnerID must not be empty')

        const businessPartner = await this.findBusinessPartnerID(businessPartnerID)

        if(!businessPartner)
            throw new Error(`businessPartner with ID ${businessPartnerID} does not exist`)

        return businessPartner
    }
}

module.exports = UserService
