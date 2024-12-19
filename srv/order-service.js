const cds = require('@sap/cds')
const { find } = require('@sap/cds/lib/utils/cds-utils')

class OrderService extends cds.ApplicationService {
  async init() {

    this.on('listProductsFromOrder', this.listProductsFromOrder)

    this.on('payInvoice', 'Invoices', this.payInvoice)

    this.on('createOrder', 'Orders', this.createOrder)
    this.after('createOrder', this.handleAfterOrder)

    await super.init()
  }

  async createOrder(customer, items) {
    try {
      const { Orders, Products } = this.entities
      if (items.length === 0)
        throw new Error('No items in the order')

      const customerRecord = await this.findCustomerByCriteria({ name: customer })
      if (!customerRecord)
        throw new Error('Customer not found')

      const orderData = { customer: { ID: customerRecord.ID }, status: 'OPEN', total: 0 }
      const [order] = await INSERT.into(Orders).entries(orderData)

      let orderTotal = 0

      for (const item of items) {
        const productRecord = await SELECT.one.from(Products).where({ ID: item.product })
        if (!productRecord) throw new Error(`Product with ID ${item.product} not found. Order Cancelled.`)
        if (productRecord.stock === 0) throw new Error(`Product with ID ${item.product} is out of stock. Order Cancelled.`)
        if (productRecord.stock < item.quantity) throw new Error(`Not enough stock for product with ID ${item.product}. Order Cancelled.`)

        const itemTotalPrice = item.quantity * productRecord.price
        const orderItemData = { order: { ID: order.ID }, product: { ID: productRecord.ID }, quantity: item.quantity, total: itemTotalPrice }

        await this.createItemOrder(orderItemData)
        orderTotal += itemTotalPrice
      }

      await UPDATE(Orders).set({ total: orderTotal }).where({ ID: order.ID })

      return order
    } catch (error) {
      throw new Error(error)
    }
  }

  async handleAfterOrder(orderID) {
    // try {
    await this.updateProductStock(orderID)
    return await this.createInvoice(orderID)
    // } catch (error) {
    throw new Error(error)
    // }
  }

  async createItemOrder(orderItemData) {
    try {
      const { OrderItems } = this.entities
      return await INSERT.into(OrderItems).entries(orderItemData)
    } catch (error) {
      throw new Error(error)
    }
  }

  async findCustomerByCriteria(queryCriteria) {
    const { Customers } = this.entities
    return await SELECT.one.from(Customers).where(queryCriteria)
  }


  async createItemOrder(item) {
    const { OrderItems } = this.entities
    await INSERT.into(OrderItems).entries(item)
  }

  async updateProductStock(orderID) {

    const { Products } = this.entities

    const orderItems = await this.findOrderItems({ order: orderID.ID })

    for (const orderItem of orderItems) {
      const productID = orderItem.product_ID
      const quantitySold = orderItem.quantity

      const productRecord = await SELECT.one.from(Products).where({ ID: productID })

      if (productRecord) {
        const updatedStock = productRecord.stock - quantitySold
        await UPDATE(Products).set({ stock: updatedStock }).where({ ID: productID })
      }
    }
  }

  async createInvoice(orderID) {
    const order = await this.findOrder({ ID: orderID.ID })

    const newInvoice = {
      order_ID: order.ID,
      amount: order.total,
      invoiceDate: new Date()
    }

    await this.insertInvoiceToDatabase(newInvoice)

    const createdInvoice = await this.findInvoice({ID: order.ID})

    return createdInvoice
  }

  async insertInvoiceToDatabase(invoiceData) {
    const { Invoices } = this.entities
    await INSERT.into(Invoices).entries(invoiceData)
  }

  async listProductsFromOrder(orderID) {

    if (!orderID || orderID === '')
      throw new Error('Order ID must not be empty')

    const orderItems = await this.findOrderItems({ order_ID: orderID })

    if (!orderItems)
      throw new Error(`Order with ID ${orderID} does not exist`)

    return orderItems
  }

  async findOrder(queryCriteria) {
    const { Orders } = this.entities
    return await SELECT.one.from(Orders).where(queryCriteria)
  }

  async findOrderItems(queryCriteria) {
    const { OrderItems } = this.entities
    return await SELECT.from(OrderItems).where(queryCriteria)
  }

  async payInvoice(invoice) {
    try {

      const { Invoices } = this.entities

      if (!invoice)
        throw new Error('The invoice ID must not be empty')

      const invoiceExists = this.findInvoice({ ID: invoice })

      if (!invoiceExists)
        throw new Error(`Invoice with ID ${invoice} does not exist`)

      await UPDATE(Invoices).set({ paymentStatus: 'PAID' })

      return 'OK'
    }
    catch (error) {
      throw new Error(error)
    }

  }

  async findInvoice(queryCriteria) {
    const { Invoices } = this.entities
    return await SELECT.one.from(Invoices).where(queryCriteria)
  }
}

module.exports = OrderService
