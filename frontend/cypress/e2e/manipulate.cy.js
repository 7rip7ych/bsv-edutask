// const { beforeEach, it, describe, before, after, cy } = require("node:test")

describe('Manipulating the todolist associated to a task', () => {
    let uid
    let email
    let taskid
    let todotext
    let todoid
    let todos
    before(function () {
        // create user
        cy.fixture('user.json')
            .then((user) => {
                cy.log(user)
                cy.request({
                    method: 'POST',
                    url: 'http://localhost:5000/users/create',
                    form: true,
                    body: user,
                    headers: { 'Cache-Control': 'no-cache' }
                }).then((response) => {
                    uid = response.body._id.$oid
                    email = user.email
                })
            })
            .then(function() {
                // create task
                cy.fixture('task.json')
                    .then((task) => {
                        task.userid = uid
                        todotext = task.todos
                        cy.request({
                            method: 'POST',
                            url: 'http://localhost:5000/tasks/create',
                            form: true,
                            body: task,
                            headers: { 'Cache-Control': 'no-cache' }
                        }).then((response) => {
                            taskid = Object.values(response.body[0]._id)[0]
                            todoid = response.body[0].todos[0]._id.$oid
                            todos = response.body[0].todos
                            cy.log(taskid)
                            cy.log(todoid)
                            cy.log(JSON.stringify(todos))
                        })
                    })
            })
    })

    beforeEach(function () {
        cy.visit('http://localhost:3000')
        cy.contains('div', 'Email Address')
            .find('input[type=text]')
            .type(email)
        cy.get('form')
            .submit()
        cy.get(`div.container-element>a`)
            .click()
    })

    describe('Entering a description', () => {
        it('description is empty', () => {
            cy.get('.inline-form')
                .find('input[type=text]')
                .clear()

            cy.get('input[value="Add"]')
                .should('be.disabled')
        })

        it('Description is not empty', () => {
            cy.get('.inline-form')
                .find('input[type=text]')
                .type('test description')

            cy.get('input[value="Add"]')
                .should('not.be.disabled')
        })

        afterEach(function() {
            cy.get('.inline-form')
                .find('input[type=text]')
                .clear()
        })
    })

    describe('Adding a todo', () => {
        it('Adding a todo with empty description', () => {
            cy.get('.inline-form')
                .find('input[type=text]')
                .clear()

            cy.intercept('POST', 'http://localhost:5000/todos/create').as('addTodo')

            cy.get('input[value="Add"]')
                .click()

            cy.wait(2000)
            cy.get('@addTodo.all').then((intercepted) => {
                expect(intercepted).to.have.length(0)
            })

            cy.get('ul.todo-list')
                .find('.todo-item')
                .last()
                .should('contain.text', 'Study components')
        })

        it('Adding a todo with a not empty description', () => {
            cy.get('.inline-form')
                .find('input[type=text]')
                .type('test description')

            cy.intercept('POST', 'http://localhost:5000/todos/create').as('addTodo')

            cy.get('input[value="Add"]')
                .click()

            cy.wait('@addTodo')

            cy.get('ul.todo-list')
                .find('.todo-item')
                .last()
                .should('contain.text', 'test description')
        })

        afterEach(function() {
            cy.request({
                method: 'DELETE',
                url: `http://localhost:5000/tasks/byid/${taskid}`,
            })
            cy.fixture('task.json')
                    .then((task) => {
                        task.userid = uid
                        todotext = task.todos
                        cy.request({
                            method: 'POST',
                            url: 'http://localhost:5000/tasks/create',
                            form: true,
                            body: task,
                            headers: { 'Cache-Control': 'no-cache' }
                        }).then((response) => {
                            taskid = Object.values(response.body[0]._id)[0]
                            todoid = response.body[0].todos[0]._id.$oid
                            todos = response.body[0].todos
                            cy.log(taskid)
                            cy.log(todoid)
                            cy.log(JSON.stringify(todos))
                        })
                    })
        })
    })

    describe('Toggling a todo', () => {

        it('todo is active', () => {
            const data = {'data': `{'$set': {'done': false}}`}
            cy.request({
                method: 'PUT',
                url: `http://localhost:5000/todos/byid/${todoid}`,
                form: true,
                body: data
            }).then(() => {
                cy.contains('li',todotext)
                    .find(`.checker`)
                    .click()

                cy.contains('li',todotext)
                    .find('.checked')
                    .should('exist')
            })
        })

        it('todo is done', () => {
            const data = {'data': `{'$set': {'done': true}}`}
            cy.request({
                method: 'PUT',
                url: `http://localhost:5000/todos/byid/${todoid}`,
                form: true,
                body: data
            }).then(() => {
                cy.contains('li', todotext)
                    .find(`.checker`)
                    .click()

                cy.contains('li', todotext)
                    .find('.checked')
                    .should('not.exist')
            })
        })

        after(function () {
            const data = {'data': `{'$set': {'done': false}}`}
            cy.request({
                method: 'PUT',
                url: `http://localhost:5000/todos/byid/${todoid}`,
                form: true,
                body: data
            })
        })
    })


    describe('Removing a todo', () => {

        it('clicking delete button', () => {
            cy.contains('li', todotext)
                .find('.remover')
                .click()

            cy.contains('li', todotext)
                .should('not.exist')
        })

    })


    after(function () {
        // clean up by deleting the user from the database
        cy.request({
          method: 'DELETE',
          url: `http://localhost:5000/users/${uid}`
        }).then((response) => {
          cy.log(response.body)
        })
      })
})