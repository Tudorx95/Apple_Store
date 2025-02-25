# Apple_Store

## Project Objectives

- [Topic and overview](#topic_and_overview)
- [Structure](#structure)
- [Functionalities](#functionalities)
- [Reference](#reference)

### Topic and overview

Apple is one of the biggest tech companies in the world and a serious market share in both hardware and software industries.
This shop is related to simulate some of the Apple Store web features and to come with new possible ideas for reaching the clients.
There are numerous categories of devices that can be managed, the most important of them being: MACs PCs and laptops, Ipad, Iphone,
Airpods, and AppleWatch. On this webstore, a user can have 3 states:

- administrator - manages all the users in the system
- regular user - user with moderate benefits, including discounts
- guest - user that has no intention in creating an account

For the webpage itself, the main components will be a navigation bar with 3 buttons.
First button may open the door to the product pages, where users can add products in their cart or may add a product in the desired list.
Second button is for redirecting to the mainpage where a product presentation is prepared.
Third button may be a sign in button where users can connect to their accounts and start buying (or managing for admin).
Fourth button is for a contact page with a map of the location of the Apple Inc.

Regarding the user level interaction:

- admin user cannot have access to nothing else than a dashboard of all user account information. He can add or delete a user from the system
  or add discounts to a specific user account.
- regular user - a user that besides the access to the products and the cart, has access to a discount page (with all available discounts)
  and a page with all desired products marked.
- guest user - a user with all privilegies as the regular user, except the two pages described earlier.

### Structure

The folder structure is organized as follows:

- backend ->
- frontend -> node js, react framework
- database ->
- images ->

### Functionalities

This application is intended to simulate a store environment whrere every user can buy as many products as it wants. When buying a product, a
regular user (user with an account) can have benefits as discounts. After inserting the delivery dates, the consumer will be redirected to a
paypall portal where it needs to insert its card credentials.
The admin user is responsible with managing all user accounts and has privilegie access to all user information including all the orders,
except the confidential information.

### Reference
