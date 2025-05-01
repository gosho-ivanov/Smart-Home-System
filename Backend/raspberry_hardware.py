import RPi.GPIO as GPIO
import time


class RoomHardware:
    def __init__(self, room_id, led_pin, fan_pin):
        self.room_id = room_id
        self.leds = {}
        self.fans = {}

        # GPIO setup
        GPIO.setmode(GPIO.BCM)

        # # PWM setup for LED
        # self.led_pwm = GPIO.PWM(self.led_pin, 100)  # 100 Hz frequency
        # self.led_pwm.start(0)  # Start with LED off

        # # PWM setup for Fan
        # self.fan_pwm = GPIO.PWM(self.fan_pin, 100)  # 100 Hz frequency
        # self.fan_pwm.start(0)  # Start with Fan off

    def add_led(self, led_id, pin):
        """
        Add an LED to the room.
        :param led_id: Unique identifier for the LED.
        :param pin: GPIO pin number for the LED.
        """
        GPIO.setup(pin, GPIO.OUT)
        self.leds[led_id] = GPIO.PWM(pin, 1_000)  # 1 kHz frequency
        self.led_pwm.start(0)  # Start with LED off

    def add_fan(self, fan_id, pin):
        """
        Add a fan to the room.
        :param fan_id: Unique identifier for the fan.
        :param pin: GPIO pin number for the fan.
        """
        GPIO.setup(pin, GPIO.OUT)
        self.fans[fan_id] = GPIO.PWM(pin, 25_000) # 25 kHZ frequency
        self.fan_pwm.start(0) # Start with Fan off

    def set_led_brightness(self, led_id, brightness):
        """
        Set the brightness of the LED.
        :param led_id: Unique identifier for the LED.
        :param brightness: Brightness level (0-100).
        """
        if led_id in self.leds:
            self.leds[led_id].ChangeDutyCycle(brightness)

    def set_fan_speed(self, fan_id, speed):
        """
        Set the speed of the fan.
        :param fan_id: Unique identifier for the fan.
        :param speed: Speed level (0-100).
        """
        if fan_id in self.fans:
            self.fans[fan_id].ChangeDutyCycle(speed)

    
    def cleanup(self):
        """Clean up GPIO and release resources."""
        self.led_pwm.stop()
        self.fan_pwm.stop()
        GPIO.cleanup()