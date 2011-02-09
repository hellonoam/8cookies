package backendTest;

import static org.mockito.Mockito.*;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import backend.AuthenticationResponse;
import backend.DatabaseInteraction;
import backend.DeleteCookiesFromServer;

@RunWith(PowerMockRunner.class)
@PrepareForTest(DatabaseInteraction.class)
public class DeleteCookiesFromServerTest {
	
	private HttpServletRequest request;
	private HttpServletResponse response;
	private PrintWriter out;
	private String username;
	private String password;
	
	@Before
	public void setUp() throws IOException{
		PowerMockito.mockStatic(DatabaseInteraction.class);
		request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        out = mock(PrintWriter.class);
        username = "user1";
        password = "pass1";
        
        //expectations
        when(request.getParameter("user")).thenReturn(username);
        when(request.getParameter("pass")).thenReturn(password);
        when(response.getWriter()).thenReturn(out);	
	}
	
	@Test 
    public void testInvalidPasswordOrUsername() throws IOException, ServletException {
        // expectations
        Mockito.when(DatabaseInteraction.authenticate(username, password)).thenReturn(
        		new AuthenticationResponse(1),new AuthenticationResponse(2));
        
        // execute
        new DeleteCookiesFromServer().doGet(request, response);
        new DeleteCookiesFromServer().doGet(request, response);
        
        //verifiers
        verify(response, never()).setContentType(anyString());
        verify(response, times(2)).sendError(
        		HttpServletResponse.SC_UNAUTHORIZED, "received incorrect credentials");;
    }
	
	private void testDeletionOfUser(boolean deleted, String outString) 
			throws IOException, ServletException{
		// expectations
        Mockito.when(DatabaseInteraction.authenticate(username, password)).thenReturn(
        		new AuthenticationResponse(0));
        Mockito.when(DatabaseInteraction.deleteUser(username)).thenReturn(deleted);
        
        // execute
        new DeleteCookiesFromServer().doGet(request, response);
        
        //verifiers
        verify(response).setContentType("text/html");
        verify(out).close();
        verify(out).println(outString);
	}
	
	@Test 
    public void testValidUsernameAndPassword() throws IOException, ServletException {
		testDeletionOfUser(true, "info for " + username + " was deleted from server");
    }
	
	@Test 
    public void testDeleteUsernameFailed() throws IOException, ServletException {
		testDeletionOfUser(false, "ERROR: failed to delete " + username + " from server");
    }
}
