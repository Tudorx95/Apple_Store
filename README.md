# Apple_Store

## Project Objectives

- [Topic and overview](#topic_and_overview)
- [Technologies](#technologies)
- [Structure](#structure)
- [Functionalities](#functionalities)
<!-- - [Reference](#reference) -->

### Topic and overview

Apple is one of the biggest tech companies in the world and a serious market share in both hardware and software industries.
This shop is related to simulate some of the Apple Store web features and to come with new possible ideas for reaching the clients.
There are numerous categories of devices that can be managed, the most important of them being: MACs PCs and laptops, Ipad, Iphone, Airpods, and AppleWatch.
On this webstore, a user can have 3 states:

- administrator - manages all the products in the system, alongside coupons or other administrative stuff
- regular user - user with moderate benefits, including discounts, that can buy products
- guest - user that has no intention in creating an account; he can only navigate through the product list,
  but cannot buy one.

For the webpage itself, the main components will be a navigation bar with several buttons.

- First button is a gif with an apple macbook, used for navigating to the homepage where a product presentation is prepared.
- Next 3 buttons may open the door to the product pages, where users can add products in their cart or may add a product in the desired list.
- Contact button with a Google Maps view of all available Apple stores in the country.
- The About Us button redirects to a special page dedicated entirely as a portfolio of the author background in Computer
  Science.
- The Search button is a loop where users can search for their preferred products by typing 3 letters of it to see the
  search results. The user can also interact with keyboard for these dynamic objects.
- Authentication button used to navigate to the Login page and from there to register page, where users can connect to their accounts and start buying (or managing for admin).
- Last button is for Cart page, where authenticated users can interact with their products

Regarding the user level interaction:

- admin user cannot have access to nothing else than a dashboard of all user account information. He can add or delete a user from the system
  or add discounts to a specific user account.
- regular user - a user that besides the access to the products and the cart, has access to a discount page (with all available discounts)
  and a page with all desired products marked.
- guest user - a user with all privilegies as the regular user, except the two pages described earlier.

### Technologies

- backend -> nodejs (REST API), Apache (WebServer used for MySQL UI)
- frontend -> HTML, CSS, Javascript, React framework
- database -> MySQL (XAMPP)

### Structure

The folder frontend structure is organized as follows:

- root project - .json config files (packages), .env (for backend URL and Google Maps API credentials)
- public/images - database for all product images
- src/ - root - App.js main app file

       - assets/ - images for page components

                 - css/ - all CSS files for frontend components

       - components/ - for all controllers -> common/ - for cryptographic functions
                                           -> layout/ - other controllers components used to render others

       - models/ - for model components as AuthContext (create and store tokens or ProductContext for details about specific products)

       - pages/ - all view components used to interact in GUI

The folder backend structure is organized as follows:

- backend/ - root - some important config file (packages), main server.js node server boot file; Email.js for the Forgot
  Password functionality; .env for frontend URL, db credentials;

             - config/ - db.js for db instantiacion; Modify_PersonalData.js for user dashboard Personal Data form

             - middleware/ - for token validation

             - routes/ - user.js for user login/register/forgot pass. parts; ProductsRoute.js for product interaction with the db; AddressInfo.js for Address part of user dashboard; admin.js for admin table requests.

### Functionalities

This application is intended to simulate a store environment where every user can buy as many products as it wants. When buying a product, the user(supposing it is logged in) select and add them to the cart. Finally, he navigates to the
Cart page where it can modify the product quantites and apply some discounts (coupons). When he is ready, he can initiate the command. He will be redirected to the payment page, where he needs to inserts the specific credentials and then a message will simulate the instantiated order.

Regular user (user with an account) can have benefits as discounts. After selecting the delivery dates from its dashboard on their accounts, the order will be prepared to initiate the command.

  <!-- The admin user is responsible with managing all user accounts and has privilegie access to all user information including all the orders, except the confidential information. -->
