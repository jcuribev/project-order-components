using fabTech as fab from '../db/schema.cds';

service SupportService @(path: '/support-service') {

  entity SupportTickets as projection on fab.SupportTickets;
  entity Supporters     as projection on fab.Supporters;
  action openTicket(user : fab.Customers:ID, order : fab.Orders:ID, subject : String, description : String) returns SupportTickets:ID;
  action assignTicket(supporter : fab.Supporters:ID, ticket : SupportTickets:ID)                            returns String;
  action resolveTicket(ticket : SupportTickets:ID)                                                          returns SupportTickets;
}
