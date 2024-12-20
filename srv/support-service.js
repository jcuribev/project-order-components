const cds = require('@sap/cds')

class SupportService extends cds.ApplicationService {
  async init() {
    this.on('openTicket', 'SupportTickets', this.openTicket)

    this.on('assignTicket', this.assignTicket)

    this.on('resolveTicket', this.resolveTicket)

    await super.init()
  }

  async openTicket(user, order, subject, description) {

    try {

      if (!user || !order || !subject || !description)
        return { code: 400, message: 'None of the fields can be empty' }

      const isOrderExist = await this.findOrder({ ID: order })

      if (!isOrderExist)
        return { code: 404, message: `Order with ID ${order} could not be found` }

      if (isOrderExist.customer.ID !== user)
        return { code: 400, message: `Order with ID ${order} is not associated with Customer ${user}` }

      const newTicket = {
        subject: subject,
        description: description,
        customer: user,
        order: order
      }

      await this.insertTicketToDatabase(newTicket)

      const createdTicket = await this.findTicketByCriteria({ order: order })

      if (!createdTicket)
        return { code: 500, message: 'The ticket could not be created' }

      return createdTicket
    } catch (error) {
      throw new Error(error)
    }
  }

  async assignTicket(supporter, ticket) {

    try {

      if (!supporter || !ticket)
        return { code: 400, message: 'None of the fields can be empty' }

      const isSupporterExist = await this.findSupporterByCriteria({ ID: supporter })

      if (!isSupporterExist)
        return { code: 404, message: `Supporter with ID ${supporter} could not be found` }

      const isTicketExist = await this.findTicketByCriteria({ ID: ticket })

      if (!isTicketExist)
        return { code: 404, message: `Ticket with ID ${ticket} could not be found` }

      isTicketExist.supporter = supporter

      await this.updateTicket(isTicketExist)

      return { code: 200, message: 'OK' }

    } catch (error) {
      throw new Error(error)
    }
  }

  async resolveTicket(ticket) {

    try {

      if (!ticket)
        return { code: 400, message: 'None of the fields can be empty' }

      const isTicketExist = await this.findTicketByCriteria({ ID: ticket })

      if (!isTicketExist)
        return { code: 404, message: `Ticket with ID ${ticket} could not be found` }

      if (!isTicketExist.status === 'RESOLVED')
        return { code: 200, message: `Ticket with ID ${ticket} is already resolved` }

      isTicketExist.status = 'RESOLVED'

      await this.updateTicket(isTicketExist)

      return { code: 200, message: 'OK' }

    } catch (error) {
      throw new Error(error)
    }
  }

  async updateTicket(ticketData) {
    const { SupportTickets } = this.entities
    await UPDATE(SupportTickets).set(ticketData).where({ ID: ticketData.ID })
  }

  async findSupporterByCriteria(queryCriteria) {
    const { Supporters } = this.entities
    return await SELECT.one.from(Supporters).where(queryCriteria)
  }

  async findTicketByCriteria(queryCriteria) {
    const { SupportTickets } = this.entities
    return await SELECT.one.from(SupportTickets).where(queryCriteria)
  }

  async insertTicketToDatabase(ticketData) {
    const { SupportTickets } = this.entities
    await INSERT.into(SupportTickets).entries(ticketData)
  }

  async findOrder(queryCriteria) {
    const { Orders } = this.entities
    return await SELECT.one.from(Orders).where(queryCriteria)
  }
}

module.exports = SupportService
