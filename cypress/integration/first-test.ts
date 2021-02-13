describe("First Test", () => {
	it("should go to homepage", () => {
		cy.visit("localhost:3001")
		.title()
		.should("eq", "Login | Uber Eats");
	});
});