const cds = require('@sap/cds')

class SupportService extends cds.ApplicationService {
  async init() {
    this.on('openTicket', 'SupportTickets', this.openTicket)

    await super.init()
  }

  async openTicket(req) {
    const { order, subject, description } = req.data

    const currentUser = req.user

    if (!currentUser) {
      req.error('UNAUTHORIZED_USER')
    }

    const newTicket = {
      subject: subject,
      description: description,
      customer_ID: currentUser.id,
      order_ID: order
    }

    const tx = cds.transaction(req)
    const result = await tx.create(fabTe, newTicket)

    return { message: 'Your desired message', data: result }
  }
}

module.exports = SupportService
