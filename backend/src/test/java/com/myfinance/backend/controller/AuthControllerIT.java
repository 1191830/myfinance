package com.myfinance.backend.controller;

import com.myfinance.backend.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIT extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder builder, String token) {
        return builder.header("Authorization", "Bearer " + token);
    }

    private String loginBody(String username, String password) {
        return "{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}";
    }

    @Test
    void login_withWrongPassword_returns401() throws Exception {
        SeededUser user = seedUserAndLogin(mockMvc);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user.username(), "not-the-password")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void changePassword_withWrongCurrentPassword_returns400AndLeavesPasswordUnchanged() throws Exception {
        SeededUser user = seedUserAndLogin(mockMvc);

        mockMvc.perform(auth(put("/api/auth/password"), user.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"wrong\",\"newPassword\":\"newpassword123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.currentPassword").exists());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user.username(), user.password())))
                .andExpect(status().isOk());
    }

    @Test
    void changePassword_withTooShortNewPassword_returns400() throws Exception {
        SeededUser user = seedUserAndLogin(mockMvc);

        mockMvc.perform(auth(put("/api/auth/password"), user.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"" + user.password() + "\",\"newPassword\":\"short\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.newPassword").exists());
    }

    @Test
    void changePassword_withCorrectCurrentPassword_swapsPasswordAndClearsMustChangeFlag() throws Exception {
        SeededUser user = seedUserAndLogin(mockMvc);

        mockMvc.perform(auth(put("/api/auth/password"), user.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"" + user.password() + "\",\"newPassword\":\"newpassword123\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user.username(), user.password())))
                .andExpect(status().isUnauthorized());

        String loginResponse = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user.username(), "newpassword123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mustChangePassword").value(false))
                .andReturn().getResponse().getContentAsString();

        String newToken = com.jayway.jsonpath.JsonPath.read(loginResponse, "$.token");
        mockMvc.perform(auth(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/auth/me"), newToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mustChangePassword").value(false));
    }
}
