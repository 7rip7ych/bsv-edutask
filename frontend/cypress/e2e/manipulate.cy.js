const { beforeEach, it, describe } = require("node:test")

describe('Manipulating the todolist associated to a task', () => {
    before(function () {
        // create user
        // login
        // create task
        // create a fabricated task from fixture
        cy.fixture('task.json')
        .then((task) => {

        })
    })
    beforeEach(function () {
        cy.visit('http://localhost:3000')
    })
    describe('Adding a task', () => {

        it('empty description', () => {})

        it('not empty description', () => {})
    })

    describe('Toggling a task', () => {

        it('task is active', () => {})

        it('task is done', () => {})
    })

    describe('Removing a task', () => {

        it('clicking delete button', () => {})

    })
    
})