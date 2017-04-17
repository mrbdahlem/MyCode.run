public class Calculator {
    private int x = 200;
	private int y = 300;
	
	public Calculator (int a, int b) {
	    this.x = a;
	    this.y = b;
	}
	
	public void testAdd() {
	    System.out.print(x + " + " + y + " = " );
		System.out.println(x + y);
	}
	
	public static void main(String[] args) {
	    Calculator cal = new Calculator(2, 3);
	    cal.testAdd();
	    new NumberPrinter(23);
	}
}
