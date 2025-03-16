describe('POST /login', () => {
    it('should log in a user successfully and return a correctly formatted email', async () => {
      const loginData = {
        email: "john.doe@example.com",
        password: "strongpassword123"
      };
  
      // Send POST request to the login endpoint
      const response = await request(app).post('/login').send(loginData);
  
      // Check if response status is 200
      expect(response.status).toBe(200);
  
      // Check if the response body contains a token
      expect(response.body.token).toBeDefined();
  
      // Validate that the email is in the correct format using a regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(response.body.email)).toBe(true);
  
      // Additionally, check if the email in the response matches the one sent in the login request
      expect(response.body.email).toBe(loginData.email);
    });
  });
  