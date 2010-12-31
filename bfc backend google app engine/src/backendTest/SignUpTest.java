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
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import backend.DatabaseInteraction;
import backend.SignUp;
import backend.User;

@RunWith(PowerMockRunner.class)
@PrepareForTest(DatabaseInteraction.class)
public class SignUpTest {

	private HttpServletRequest request;
	private HttpServletResponse response;
	private PrintWriter out;
	private String username;
	private String password;
	private String invite;
	private String email;
	private String callback;
	private User u;
	
	@Before
	public void setUp() throws IOException{
		PowerMockito.mockStatic(DatabaseInteraction.class);
		request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        out = mock(PrintWriter.class);
        u = mock(User.class);
        username = "user1";
        password = "pass1";
        invite = "invite1";
        email = "email1";
        callback = "jsonp23423";
        
        //expectations
        when(request.getParameter("user")).thenReturn(username);
        when(request.getParameter("pass")).thenReturn(password);
        when(request.getParameter("invite")).thenReturn(invite);
        when(request.getParameter("email")).thenReturn(email);
        when(request.getParameter("callback")).thenReturn(callback);
        when(response.getWriter()).thenReturn(out);
	}

	@Test
	public void testExistingUser() throws IOException, ServletException{
		//expectations
		when(DatabaseInteraction.getUser(username)).thenReturn(u);
		 
		//execute
	    new SignUp().doGet(request, response);
	        
	    //verifiers
	    verify(out).println(callback + "({response: 'in-use'});");
	    verify(out).close();
	}
	
	@Test
	public void testInvalidInvite() throws IOException, ServletException{
		//expectations
		when(DatabaseInteraction.getUser(username)).thenReturn(null);
		when(DatabaseInteraction.removeInvite(invite)).thenReturn(false);
		
		//execute
	    new SignUp().doGet(request, response);
	        
	    //verifiers
	    verify(out).println(callback + "({response: 'unknown-invitation'});");
	    verify(out).close();
	}
	
	public void setUpForSave(boolean succeeded) throws IOException, ServletException{
		//expectation
		when(DatabaseInteraction.getUser(username)).thenReturn(null);
		when(DatabaseInteraction.removeInvite(invite)).thenReturn(true);
		when(DatabaseInteraction.updateOrSaveUser((User)anyObject())).thenReturn(succeeded);
		
		//execute
	    new SignUp().doGet(request, response);
	}
	
	@Test
	public void testSaveSucceeded() throws IOException, ServletException{
		setUpForSave(true);

	    //verifiers
	    verify(out).println(callback + "({response: 'success'});");
	    verify(out).close();
	}
	
	@Test
	public void testSaveFailed() throws IOException, ServletException{
		setUpForSave(false);
	        
	    //verifiers
		verify(response).sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "failed to signup user");
	}

}
