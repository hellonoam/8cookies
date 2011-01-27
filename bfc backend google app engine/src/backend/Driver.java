package backend;

public class Driver {
	public static void main(String[] args){
		User u = new User("hello", "noam", "eee", "");
		System.out.println(u.comparePassword("noam"));
	}
}
