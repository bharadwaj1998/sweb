import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const DocsPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">SWeb Documentation</h1>
        <p className="text-gray-600 mb-8">Learn how to build applications with the SWeb language</p>

        <Tabs defaultValue="language">
          <TabsList className="mb-6">
            <TabsTrigger value="language">Language Reference</TabsTrigger>
            <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="language">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>SWeb Language Reference</CardTitle>
                <CardDescription>
                  SWeb is a domain-specific language for creating SaaS applications with a single file.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="model">
                    <AccordionTrigger>Models</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">
                        Models define the data structure of your application. Each model has fields that define the properties of the data.
                      </p>

                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <pre className="text-sm">
{`model User {
  field name: text required;
  field email: text required;
  field age: number;
  field isActive: boolean default = true;
}`}
                        </pre>
                      </div>

                      <h4 className="font-semibold mb-2">Field Types</h4>
                      <ul className="list-disc pl-6 mb-4">
                        <li><code>text</code> - String values</li>
                        <li><code>number</code> - Numeric values</li>
                        <li><code>boolean</code> - true/false values</li>
                        <li><code>date</code> - Date values</li>
                      </ul>

                      <h4 className="font-semibold mb-2">Field Modifiers</h4>
                      <ul className="list-disc pl-6">
                        <li><code>required</code> - Field must have a value</li>
                        <li><code>default = value</code> - Default value for the field</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="forms">
                    <AccordionTrigger>Forms</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">
                        Forms allow users to create or edit model data. You can specify which fields from the model should be included in the form.
                      </p>

                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <pre className="text-sm">
{`form UserForm(User) {
  name, email, age
}`}
                        </pre>
                      </div>

                      <p>
                        This creates a form for the User model that includes the name, email, and age fields.
                        If you leave the field list empty, all fields will be included.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="lists">
                    <AccordionTrigger>Lists</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">
                        Lists display collections of model data in a table format. You can specify which fields to display.
                      </p>

                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <pre className="text-sm">
{`list UserList(User) {
  name, email, isActive
}`}
                        </pre>
                      </div>

                      <p>
                        This creates a table that displays the name, email, and isActive fields from the User model.
                        If you leave the field list empty, all fields will be displayed.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="views">
                    <AccordionTrigger>Views</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">
                        Views display a single model instance. You can specify which fields to display.
                      </p>

                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <pre className="text-sm">
{`view UserView(User) {
  name, email, age, isActive
}`}
                        </pre>
                      </div>

                      <p>
                        This creates a view that displays the name, email, age, and isActive fields from a User model instance.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="pages">
                    <AccordionTrigger>Pages</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">
                        Pages compose forms, lists, and views into a complete user interface. You specify the components that should appear on the page.
                      </p>

                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <pre className="text-sm">
{`page UserManager("User Management") {
  UserForm, UserList
}`}
                        </pre>
                      </div>

                      <p>
                        This creates a page titled "User Management" that includes the UserForm and UserList components.
                        The first argument is the page title that will be displayed in the header.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorial">
            <Card>
              <CardHeader>
                <CardTitle>Building Your First SWeb App</CardTitle>
                <CardDescription>
                  Follow this tutorial to create a simple contact management application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>Step 1: Define the Contact Model</h3>
                  <p>
                    Let's start by defining a <code>Contact</code> model with some basic fields:
                  </p>
                  <pre className="bg-gray-50 p-4 rounded-md">
{`model Contact {
  field name: text required;
  field email: text required;
  field phone: text;
  field company: text;
  field notes: text;
}`}
                  </pre>

                  <h3>Step 2: Create a Form for Adding Contacts</h3>
                  <p>
                    Now, let's create a form that will allow users to add new contacts:
                  </p>
                  <pre className="bg-gray-50 p-4 rounded-md">
{`form ContactForm(Contact) {
  name, email, phone, company, notes
}`}
                  </pre>

                  <h3>Step 3: Create a List to Display Contacts</h3>
                  <p>
                    We'll need a way to display our contacts:
                  </p>
                  <pre className="bg-gray-50 p-4 rounded-md">
{`list ContactList(Contact) {
  name, email, phone, company
}`}
                  </pre>

                  <h3>Step 4: Define the Main Page</h3>
                  <p>
                    Finally, let's create a page that combines the form and list:
                  </p>
                  <pre className="bg-gray-50 p-4 rounded-md">
{`page ContactManager("Contact Manager") {
  ContactForm, ContactList
}`}
                  </pre>

                  <h3>Step 5: Compile and Run</h3>
                  <p>
                    That's it! Now you can compile your SWeb code and run your application. The system will automatically generate the HTML, CSS, and JavaScript needed to create a functional contact management application.
                  </p>

                  <div className="p-4 border border-blue-200 rounded-md bg-blue-50">
                    <h4 className="text-blue-700 font-bold">Note</h4>
                    <p className="text-blue-700">
                      The SWeb compiler handles all the boilerplate code for you - creating the data storage, form validation, event handling, and UI rendering. You just need to define what you want, not how to implement it.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples">
            <Card>
              <CardHeader>
                <CardTitle>Example Applications</CardTitle>
                <CardDescription>
                  Copy and paste these examples to get started quickly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-3">Todo List Application</h3>
                <pre className="bg-gray-50 p-4 rounded-md mb-6 overflow-auto text-sm">
{`// Define a task model
model Task {
  field title: text required;
  field description: text;
  field dueDate: date;
  field completed: boolean default = false;
  field priority: text;
}

// Create a form to add new tasks
form TaskForm(Task) {
  title, description, dueDate, priority
}

// Create a list to display tasks
list TaskList(Task) {
  title, dueDate, completed, priority
}

// Define the main page
page TodoApp("Todo List Application") {
  TaskForm, TaskList
}`}
                </pre>

                <h3 className="text-lg font-semibold mb-3">Blog Application</h3>
                <pre className="bg-gray-50 p-4 rounded-md mb-6 overflow-auto text-sm">
{`// Define an author model
model Author {
  field name: text required;
  field email: text required;
  field bio: text;
}

// Define a post model
model Post {
  field title: text required;
  field content: text required;
  field publishDate: date required;
  field published: boolean default = false;
  field author: text required;
}

// Create forms
form AuthorForm(Author) {
  name, email, bio
}

form PostForm(Post) {
  title, content, publishDate, published, author
}

// Create lists
list AuthorList(Author) {
  name, email
}

list PostList(Post) {
  title, publishDate, published, author
}

// Define pages
page AuthorManager("Author Management") {
  AuthorForm, AuthorList
}

page PostManager("Post Management") {
  PostForm, PostList
}`}
                </pre>

                <h3 className="text-lg font-semibold mb-3">Inventory Management</h3>
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
{`// Define product model
model Product {
  field name: text required;
  field description: text;
  field sku: text required;
  field price: number required;
  field quantity: number required default = 0;
  field category: text;
}

// Define category model
model Category {
  field name: text required;
  field description: text;
}

// Create forms
form ProductForm(Product) {
  name, description, sku, price, quantity, category
}

form CategoryForm(Category) {
  name, description
}

// Create lists
list ProductList(Product) {
  name, sku, price, quantity, category
}

list CategoryList(Category) {
  name, description
}

// Define pages
page ProductManager("Product Management") {
  ProductForm, ProductList
}

page CategoryManager("Category Management") {
  CategoryForm, CategoryList
}`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DocsPage;
