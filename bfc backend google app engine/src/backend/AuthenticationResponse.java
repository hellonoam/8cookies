package backend;

public class AuthenticationResponse {
	private int responseType;
	private long waitTime;
	public AuthenticationResponse(int responseType){
		this.responseType = responseType;
	}
	
	public AuthenticationResponse(int responseType, long waitTime){
		this.responseType = responseType;
		this.waitTime = waitTime;
	}
	
	public int getResponseType(){
		return responseType;
	}
	
	public long getWaitTime(){
		return waitTime;
	}
}
