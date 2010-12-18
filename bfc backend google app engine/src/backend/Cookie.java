package backend;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Text;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable
public class Cookie {
	
	private JsonParser jp = new JsonParser();
	
    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;

    @Persistent
    private Text jsonCookie;

    public Cookie(String name) {
    	this.jsonCookie = new Text(name);
    }
    
    public Key getKey() {
        return key;
    }

    public String getJsonAsStringCookie() {
        return jsonCookie.toString();
    }
    
    public JsonElement getJsonCookie() {
    	return jp.parse(getJsonAsStringCookie());
    }
}
