module.exports = {
	client: {
		includes: ["./src/**/*.{tsx,ts}"],
		tagName: "gql",
		service: {
			name: "uber_eats_backend",
			url: "https://bycproject.run.goorm.io/graphql",
		}
	}
}