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
import backend.SendData;
import backend.User;

@RunWith(PowerMockRunner.class)
@PrepareForTest(DatabaseInteraction.class)
public class SendDataTest {

	private HttpServletRequest request;
	private HttpServletResponse response;
	private PrintWriter out;
	private String username;
	private String password;
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
        
        //expectations
        when(request.getParameter("user")).thenReturn(username);
        when(request.getParameter("pass")).thenReturn(password);
        when(response.getWriter()).thenReturn(out);
	}

	@Test
	public void testInvalidUsernameOrPassword() throws IOException, ServletException{
		//expectations
		when(DatabaseInteraction.authenticate(username, password)).thenReturn(1,2);
		 
		//execute
	    new SendData().doGet(request, response);
	    new SendData().doGet(request, response);
	        
	    //verifiers
	    verify(response, times(2)).sendError(
	    	HttpServletResponse.SC_UNAUTHORIZED, "received incorrect credentials");;
	}

	@Test
	public void testInvalidInfoFromUser() throws IOException, ServletException{
		//expectations
		when(DatabaseInteraction.authenticate(username, password)).thenReturn(0);
		when(DatabaseInteraction.getUser(username)).thenReturn(u);
		when(u.getInfo()).thenReturn("", (String)null);
		
		//execute
		new SendData().doGet(request, response);
		new SendData().doGet(request, response);
		
		//verifiers
		verify(out, never()).println(anyString());
	}

	@Test
	public void testValidResponse() throws IOException, ServletException{
		//expectations
		when(DatabaseInteraction.authenticate(username, password)).thenReturn(0);
		when(DatabaseInteraction.getUser(username)).thenReturn(u);
		String info = "{test}";
		when(u.getInfo()).thenReturn(info);
		
		//execute
		new SendData().doGet(request, response);
		
		//verifiers
		verify(response).setContentType("text/html");
		verify(out).println(info);
		verify(out).close();
	}
}
